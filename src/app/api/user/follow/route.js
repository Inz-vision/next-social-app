import User from '../../../../lib/models/user.model';
import { connect } from '../../../../lib/mongodb/mongoose';
import { currentUser } from '@clerk/nextjs/server';

export const POST = async (req) => {
  try {
    await connect();

    const user = await currentUser();
    console.log('Current User:', user);

    const data = await req.json();
    console.log('Request Data:', data);

    const userProfileId = data.userProfileId;
    const userWhoFollowsId = data.userWhofollowsId;

    if (!user || user.publicMetadata.userMongoId !== userWhoFollowsId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const [userWhoFollowsFromMongoDB, userProfileIdFromMongoDB] = await Promise.all([
      User.findById(userWhoFollowsId),
      User.findById(userProfileId),
    ]);

    if (!userWhoFollowsFromMongoDB) {
      return new Response(
        JSON.stringify({ error: 'User who follows not found in the db' }),
        { status: 404 }
      );
    }

    if (!userProfileIdFromMongoDB) {
      return new Response(
        JSON.stringify({ error: 'User to follow not found in the db' }),
        { status: 404 }
      );
    }

    // Prevent user from following themselves
    if (userWhoFollowsFromMongoDB._id.toString() === userProfileIdFromMongoDB._id.toString()) {
      return new Response(
        JSON.stringify({ error: 'You cannot follow yourself' }),
        { status: 400 }
      );
    }

    const isFollowing = userWhoFollowsFromMongoDB.following.find(
      (item) => item.toString() === userProfileIdFromMongoDB._id.toString()
    );

    if (isFollowing) {
      // Unfollow logic
      userWhoFollowsFromMongoDB.following = userWhoFollowsFromMongoDB.following.filter(
        (item) => item.toString() !== userProfileIdFromMongoDB._id.toString()
      );
      userProfileIdFromMongoDB.followers = userProfileIdFromMongoDB.followers.filter(
        (item) => item.toString() !== userWhoFollowsFromMongoDB._id.toString()
      );
    } else {
      // Follow logic
      userWhoFollowsFromMongoDB.following.push(userProfileIdFromMongoDB._id);
      userProfileIdFromMongoDB.followers.push(userWhoFollowsFromMongoDB._id);
    }

    await Promise.all([
      userWhoFollowsFromMongoDB.save(),
      userProfileIdFromMongoDB.save(),
    ]);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Error in follow route:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to follow/unfollow user' }),
      { status: 500 }
    );
  }
};