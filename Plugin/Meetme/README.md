# Installation
Place the Meetme directory in your NodeBot plugin directory.
Move the Meetme.yml to your NodeBot config directory.

# Configuration
Meetme is configured in config/Meetme.yml, with the following configuration settings:

timeout             The amount of time an invitation will remain available, in seconds. (Minimum 30 seconds)
block_on_ignore     The amount of time a player will be blocked after they are ignored. (0 to disable this option)

# Commands
## Meet
Syntax: meet <name>
        meetme <name>

This command allows a user to invite another user to join him in his current
location.  The second player will be then given the opportunity to join,
decline, or ignore the invitation.

## Mjoin
Syntax: mjoin <name>

This command will teleport you to a user who has sent you a request to meet.

## Mdecline
Syntax: mdecline <name>

Thgis command will politely decline a request to meet.

## Mignore
Syntax: mignore <name>

This command will ignore an invitation to meet, and block future invitations from
  the user for a period of time.