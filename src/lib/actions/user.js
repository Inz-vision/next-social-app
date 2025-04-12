import User from '../models/user.model';
import { connect } from '../mongodb/mongoose';

export const createOrUpdateUser = async (
  id,
  first_name,
  last_name,
  image_url,
  email_addresses,
  username
) => {
  try {
    await connect();

    // Create or update the user in MongoDB
    const user = await User.findOneAndUpdate(
      { clerkId: id },
      {
        $set: {
          firstName: first_name,
          lastName: last_name,
          avatar: image_url,
          email: email_addresses[0]?.email_address || '', // Handle missing email
          username,
        },
      },
      { new: true, upsert: true } // Return the updated document and create if not found
    );

    if (!user) {
      console.error('Failed to create or update user in MongoDB');
      throw new Error('Failed to create or update user');
    }

    console.log('User created/updated in MongoDB:', user);
    return user; // Ensure the user object with _id is returned
  } catch (error) {
    console.error('Error creating or updating user:', error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    await connect();

    // Find and delete the user
    const user = await User.findOneAndDelete({ clerkId: id });

    if (user) {
      console.log(`Deleted user with Clerk ID: ${id} and MongoDB ID: ${user._id}`);

      // Optionally, delete related data (e.g., posts, followers)
      // Example: await Post.deleteMany({ user: user._id });
    } else {
      console.log(`No user found with Clerk ID: ${id}`);
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};