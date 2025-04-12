import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { clerkClient } from '@clerk/nextjs/server';
import { createOrUpdateUser, deleteUser } from '../../../lib/actions/user';

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      'Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local'
    );
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing Svix headers:', { svix_id, svix_timestamp, svix_signature });
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  const payload = await req.json();
  console.log('Webhook Payload:', payload);

  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err.stack);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  const { id } = evt?.data;
  const eventType = evt?.type;
  console.log(`Webhook with ID: ${id}, Type: ${eventType}`);

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, first_name, last_name, image_url, email_addresses, username } = evt?.data;
    try {
      // Create or update the user in MongoDB
      const user = await createOrUpdateUser(
        id,
        first_name,
        last_name,
        image_url,
        email_addresses,
        username
      );
      console.log('Created/Updated User in MongoDB:', user);
  
      if (user) {
        try {
          // Update Clerk's publicMetadata with the MongoDB _id
          await clerkClient.users.updateUserMetadata(id, {
            publicMetadata: {
              userMongoId: user._id.toString(), // Ensure MongoDB _id is stored
            },
          });
          console.log('Updated Clerk publicMetadata for user:', id);
        } catch (error) {
          console.error('Error updating user metadata in Clerk:', error.stack);
        }
      } else {
        console.error('User not found or created in MongoDB');
      }
    } catch (error) {
      console.error('Error creating or updating user in MongoDB:', error.stack);
      return new Response('Error occurred', {
        status: 400,
      });
    }
  }

  if (eventType === 'user.deleted') {
    try {
      console.log('Deleting User with ID:', id);
      await deleteUser(id);
    } catch (error) {
      console.error('Error deleting user:', error.stack);
      return new Response('Error occurred', {
        status: 400,
      });
    }
  }

  return new Response('', { status: 200 });
}