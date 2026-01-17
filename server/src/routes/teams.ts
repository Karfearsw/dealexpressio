import { Router, Request, Response } from 'express';
import { db } from '../db';
import { teams, teamMembers, teamCodes, users } from '../db/schema';
import { eq, and, desc, gt, or, isNull } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';
import crypto from 'crypto';

const router = Router();

function generateTeamCode(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
}

// Get team members for assignment dropdown (lightweight endpoint)
router.get('/members-for-assignment', requireAuth, async (req: Request, res: Response) => {
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });

        const [membership] = await db.select({
            teamId: teamMembers.teamId,
            role: teamMembers.role,
        })
            .from(teamMembers)
            .where(eq(teamMembers.userId, req.session.userId))
            .limit(1);

        if (!membership) {
            // User not in a team - still include self in members so they can assign to themselves
            const [currentUser] = await db.select({
                firstName: users.firstName,
                lastName: users.lastName,
                email: users.email,
            }).from(users).where(eq(users.id, req.session.userId));
            
            return res.json({ 
                isAdmin: false, 
                currentUserId: req.session.userId,
                members: currentUser ? [{
                    userId: req.session.userId,
                    name: currentUser.firstName && currentUser.lastName 
                        ? `${currentUser.firstName} ${currentUser.lastName}` 
                        : currentUser.email,
                    email: currentUser.email,
                    role: 'owner',
                }] : []
            });
        }

        const isAdmin = ['owner', 'admin'].includes(membership.role);
        
        // Get all team members for the dropdown
        const members = await db.select({
            userId: teamMembers.userId,
            role: teamMembers.role,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
        })
            .from(teamMembers)
            .innerJoin(users, eq(teamMembers.userId, users.id))
            .where(eq(teamMembers.teamId, membership.teamId));

        res.json({ 
            isAdmin, 
            currentUserId: req.session.userId,
            teamId: membership.teamId,
            members: members.map((m: { userId: number; firstName: string | null; lastName: string | null; email: string; role: string }) => ({
                userId: m.userId,
                name: m.firstName && m.lastName ? `${m.firstName} ${m.lastName}` : m.email,
                email: m.email,
                role: m.role,
            }))
        });
    } catch (error) {
        console.error('Error fetching team members for assignment:', error);
        res.status(500).json({ message: 'Error fetching team members' });
    }
});

// Get user's primary team with full details
router.get('/my-team', requireAuth, async (req: Request, res: Response) => {
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });

        const [membership] = await db.select({
            teamId: teamMembers.teamId,
            role: teamMembers.role,
        })
            .from(teamMembers)
            .where(eq(teamMembers.userId, req.session.userId))
            .limit(1);

        if (!membership) {
            return res.status(404).json({ message: 'Not a member of any team' });
        }

        const [team] = await db.select().from(teams).where(eq(teams.id, membership.teamId));
        
        const members = await db.select({
            id: teamMembers.id,
            userId: teamMembers.userId,
            role: teamMembers.role,
            joinedAt: teamMembers.joinedAt,
            user: {
                email: users.email,
            }
        })
            .from(teamMembers)
            .innerJoin(users, eq(teamMembers.userId, users.id))
            .where(eq(teamMembers.teamId, membership.teamId));

        const codes = await db.select().from(teamCodes)
            .where(and(eq(teamCodes.teamId, membership.teamId), eq(teamCodes.isActive, true)));

        res.json({ ...team, members, codes });
    } catch (error) {
        console.error('Error fetching my team:', error);
        res.status(500).json({ message: 'Error fetching team' });
    }
});

// Deactivate team code
router.delete('/:id/codes/:codeId', requireAuth, async (req: Request, res: Response) => {
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });

        const teamId = parseInt(req.params.id);
        const codeId = parseInt(req.params.codeId);

        const [membership] = await db.select().from(teamMembers)
            .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, req.session.userId)));

        if (!membership || !['owner', 'admin'].includes(membership.role)) {
            return res.status(403).json({ message: 'Only team owners and admins can deactivate codes' });
        }

        await db.update(teamCodes)
            .set({ isActive: false })
            .where(and(eq(teamCodes.id, codeId), eq(teamCodes.teamId, teamId)));

        res.json({ message: 'Code deactivated' });
    } catch (error) {
        console.error('Error deactivating code:', error);
        res.status(500).json({ message: 'Error deactivating code' });
    }
});

// Leave team (delete own membership)
router.delete('/:id/members', requireAuth, async (req: Request, res: Response) => {
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });

        const teamId = parseInt(req.params.id);

        const [membership] = await db.select().from(teamMembers)
            .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, req.session.userId)));

        if (!membership) {
            return res.status(404).json({ message: 'You are not a member of this team' });
        }

        if (membership.role === 'owner') {
            return res.status(400).json({ message: 'Owner cannot leave team. Transfer ownership first.' });
        }

        await db.delete(teamMembers)
            .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, req.session.userId)));

        res.json({ message: 'Successfully left team' });
    } catch (error) {
        console.error('Error leaving team:', error);
        res.status(500).json({ message: 'Error leaving team' });
    }
});

// Update member role
router.put('/:id/members/:memberId/role', requireAuth, async (req: Request, res: Response) => {
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });

        const teamId = parseInt(req.params.id);
        const memberId = parseInt(req.params.memberId);
        const { role } = req.body;

        if (!['admin', 'member'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const [currentUserMembership] = await db.select().from(teamMembers)
            .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, req.session.userId)));

        if (!currentUserMembership || !['owner', 'admin'].includes(currentUserMembership.role)) {
            return res.status(403).json({ message: 'Only team owners and admins can change member roles' });
        }

        const [updated] = await db.update(teamMembers)
            .set({ role })
            .where(and(eq(teamMembers.id, memberId), eq(teamMembers.teamId, teamId)))
            .returning();

        res.json(updated);
    } catch (error) {
        console.error('Error updating member role:', error);
        res.status(500).json({ message: 'Error updating member role' });
    }
});

// Get user's teams
router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });

        const userTeams = await db.select({
            id: teams.id,
            name: teams.name,
            description: teams.description,
            ownerId: teams.ownerId,
            role: teamMembers.role,
            createdAt: teams.createdAt,
        })
            .from(teamMembers)
            .innerJoin(teams, eq(teamMembers.teamId, teams.id))
            .where(eq(teamMembers.userId, req.session.userId))
            .orderBy(desc(teams.createdAt));

        res.json(userTeams);
    } catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({ message: 'Error fetching teams' });
    }
});

// Get team details with members
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });

        const teamId = parseInt(req.params.id);

        const [membership] = await db.select().from(teamMembers)
            .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, req.session.userId)));

        if (!membership) {
            return res.status(403).json({ message: 'You are not a member of this team' });
        }

        const [team] = await db.select().from(teams).where(eq(teams.id, teamId));
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        const members = await db.select({
            id: teamMembers.id,
            userId: teamMembers.userId,
            role: teamMembers.role,
            joinedAt: teamMembers.joinedAt,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
        })
            .from(teamMembers)
            .innerJoin(users, eq(teamMembers.userId, users.id))
            .where(eq(teamMembers.teamId, teamId));

        res.json({
            ...team,
            members,
            currentUserRole: membership.role
        });
    } catch (error) {
        console.error('Error fetching team:', error);
        res.status(500).json({ message: 'Error fetching team' });
    }
});

// Create new team
router.post('/', requireAuth, async (req: Request, res: Response) => {
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });

        const { name, description } = req.body;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ message: 'Team name is required' });
        }

        const [newTeam] = await db.insert(teams).values({
            name: name.trim(),
            description: description?.trim() || null,
            ownerId: req.session.userId,
        }).returning();

        await db.insert(teamMembers).values({
            teamId: newTeam.id,
            userId: req.session.userId,
            role: 'owner',
        });

        res.status(201).json(newTeam);
    } catch (error) {
        console.error('Error creating team:', error);
        res.status(500).json({ message: 'Error creating team' });
    }
});

// Generate team invite code
router.post('/:id/codes', requireAuth, async (req: Request, res: Response) => {
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });

        const teamId = parseInt(req.params.id);
        const { expiresInDays, maxUses } = req.body;

        const [membership] = await db.select().from(teamMembers)
            .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, req.session.userId)));

        if (!membership || !['owner', 'admin'].includes(membership.role)) {
            return res.status(403).json({ message: 'Only team owners and admins can generate invite codes' });
        }

        const code = generateTeamCode();
        const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : null;

        const [newCode] = await db.insert(teamCodes).values({
            teamId,
            code,
            createdBy: req.session.userId,
            expiresAt,
            maxUses: maxUses || null,
        }).returning();

        res.status(201).json(newCode);
    } catch (error) {
        console.error('Error generating team code:', error);
        res.status(500).json({ message: 'Error generating team code' });
    }
});

// Get active team codes (for admins/owners)
router.get('/:id/codes', requireAuth, async (req: Request, res: Response) => {
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });

        const teamId = parseInt(req.params.id);

        const [membership] = await db.select().from(teamMembers)
            .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, req.session.userId)));

        if (!membership || !['owner', 'admin'].includes(membership.role)) {
            return res.status(403).json({ message: 'Only team owners and admins can view invite codes' });
        }

        const codes = await db.select().from(teamCodes)
            .where(and(
                eq(teamCodes.teamId, teamId),
                eq(teamCodes.isActive, true)
            ))
            .orderBy(desc(teamCodes.createdAt));

        res.json(codes);
    } catch (error) {
        console.error('Error fetching team codes:', error);
        res.status(500).json({ message: 'Error fetching team codes' });
    }
});

// Join team with code
router.post('/join', requireAuth, async (req: Request, res: Response) => {
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });

        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ message: 'Team code is required' });
        }

        const [teamCode] = await db.select().from(teamCodes)
            .where(and(
                eq(teamCodes.code, code.toUpperCase()),
                eq(teamCodes.isActive, true)
            ));

        if (!teamCode) {
            return res.status(404).json({ message: 'Invalid or expired team code' });
        }

        if (teamCode.expiresAt && new Date(teamCode.expiresAt) < new Date()) {
            return res.status(400).json({ message: 'This team code has expired' });
        }

        if (teamCode.maxUses && teamCode.usedCount >= teamCode.maxUses) {
            return res.status(400).json({ message: 'This team code has reached its usage limit' });
        }

        const [existingMembership] = await db.select().from(teamMembers)
            .where(and(eq(teamMembers.teamId, teamCode.teamId), eq(teamMembers.userId, req.session.userId)));

        if (existingMembership) {
            return res.status(400).json({ message: 'You are already a member of this team' });
        }

        await db.insert(teamMembers).values({
            teamId: teamCode.teamId,
            userId: req.session.userId,
            role: 'member',
        });

        await db.update(teamCodes)
            .set({ usedCount: teamCode.usedCount + 1 })
            .where(eq(teamCodes.id, teamCode.id));

        const [team] = await db.select().from(teams).where(eq(teams.id, teamCode.teamId));

        res.json({ message: 'Successfully joined team', team });
    } catch (error) {
        console.error('Error joining team:', error);
        res.status(500).json({ message: 'Error joining team' });
    }
});

// Leave team
router.post('/:id/leave', requireAuth, async (req: Request, res: Response) => {
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });

        const teamId = parseInt(req.params.id);

        const [membership] = await db.select().from(teamMembers)
            .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, req.session.userId)));

        if (!membership) {
            return res.status(404).json({ message: 'You are not a member of this team' });
        }

        if (membership.role === 'owner') {
            const otherMembers = await db.select().from(teamMembers)
                .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, req.session.userId)));

            if (otherMembers.length === 1) {
                await db.delete(teams).where(eq(teams.id, teamId));
                return res.json({ message: 'Team deleted (you were the only member)' });
            }
            return res.status(400).json({ message: 'Transfer ownership before leaving the team' });
        }

        await db.delete(teamMembers)
            .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, req.session.userId)));

        res.json({ message: 'Successfully left team' });
    } catch (error) {
        console.error('Error leaving team:', error);
        res.status(500).json({ message: 'Error leaving team' });
    }
});

// Update team member role (owner only)
router.patch('/:id/members/:memberId', requireAuth, async (req: Request, res: Response) => {
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });

        const teamId = parseInt(req.params.id);
        const memberId = parseInt(req.params.memberId);
        const { role } = req.body;

        if (!['admin', 'member'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const [currentUserMembership] = await db.select().from(teamMembers)
            .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, req.session.userId)));

        if (!currentUserMembership || currentUserMembership.role !== 'owner') {
            return res.status(403).json({ message: 'Only team owners can change member roles' });
        }

        const [updated] = await db.update(teamMembers)
            .set({ role })
            .where(and(eq(teamMembers.id, memberId), eq(teamMembers.teamId, teamId)))
            .returning();

        if (!updated) {
            return res.status(404).json({ message: 'Team member not found' });
        }

        res.json(updated);
    } catch (error) {
        console.error('Error updating member role:', error);
        res.status(500).json({ message: 'Error updating member role' });
    }
});

// Remove team member (owner/admin only)
router.delete('/:id/members/:memberId', requireAuth, async (req: Request, res: Response) => {
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });

        const teamId = parseInt(req.params.id);
        const memberId = parseInt(req.params.memberId);

        const [currentUserMembership] = await db.select().from(teamMembers)
            .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, req.session.userId)));

        if (!currentUserMembership || !['owner', 'admin'].includes(currentUserMembership.role)) {
            return res.status(403).json({ message: 'Only team owners and admins can remove members' });
        }

        const [memberToRemove] = await db.select().from(teamMembers)
            .where(and(eq(teamMembers.id, memberId), eq(teamMembers.teamId, teamId)));

        if (!memberToRemove) {
            return res.status(404).json({ message: 'Team member not found' });
        }

        if (memberToRemove.role === 'owner') {
            return res.status(400).json({ message: 'Cannot remove the team owner' });
        }

        await db.delete(teamMembers).where(eq(teamMembers.id, memberId));

        res.json({ message: 'Member removed from team' });
    } catch (error) {
        console.error('Error removing member:', error);
        res.status(500).json({ message: 'Error removing member' });
    }
});

export default router;
