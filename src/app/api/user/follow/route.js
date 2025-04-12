import User from '../../../../lib/models/user.model';
import { connect } from '../../../../lib/mongodb/mongoose';
import { currentUser } from '@clerk/nextjs/server';

export const POST = async (req) => {
  try {
    await connect();

    const user = await currentUser();
    console.log('Current User:', user);
    console.log('user.publicMetadata.userMongoId:', user?.publicMetadata?.userMongoId);

    const data = await req.json();
    console.log('Request Data:', data);

    const userProfileId = data.userProfileId;
    const userWhoFollowsId = data.userWhofollowsId;

    if (!user || user.publicMetadata.userMongoId !== userWhoFollowsId) {
      console.error('Unauthorized: User Mongo ID mismatch or missing.');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    if (!userProfileId || !userWhoFollowsId) {
      console.error('Invalid request data:', data);
      return new Response(
        JSON.stringify({ error: 'Invalid request data' }),
        { status: 400 }
      );
    }

    const [userWhoFollowsFromMongoDB, userProfileIdFromMongoDB] = await Promise.all([
      User.findById(userWhoFollowsId),
      User.findById(userProfileId),
    ]);

    console.log('User who follows from MongoDB:', userWhoFollowsFromMongoDB);
    console.log('User to follow from MongoDB:', userProfileIdFromMongoDB);

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

    const isFollowing = userWhoFollowsFromMongoDB.following.find(
      (item) => item.toString() === userProfileIdFromMongoDB._id.toString()
    );

    if (isFollowing) {
      userWhoFollowsFromMongoDB.following = userWhoFollowsFromMongoDB.following.filter(
        (item) => item.toString() !== userProfileIdFromMongoDB._id.toString()
      );
      userProfileIdFromMongoDB.followers = userProfileIdFromMongoDB.followers.filter(
        (item) => item.toString() !== userWhoFollowsFromMongoDB._id.toString()
      );
    } else {
      userWhoFollowsFromMongoDB.following.push(userProfileIdFromMongoDB._id);
      userProfileIdFromMongoDB.followers.push(userWhoFollowsFromMongoDB._id);
    }

    await Promise.all([
      userWhoFollowsFromMongoDB.save(),
      userProfileIdFromMongoDB.save(),
    ]);

    console.log('After update - userWhoFollows:', userWhoFollowsFromMongoDB);
    console.log('After update - userProfile:', userProfileIdFromMongoDB);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Error in follow route:', err.stack);
    return new Response(
      JSON.stringify({ error: 'Failed to follow/unfollow user' }),
      { status: 500 }
    );
  }
};