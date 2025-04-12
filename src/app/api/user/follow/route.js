import User from '../../../../lib/models/user.model';
import { connect } from '../../../../lib/mongodb/mongoose';

export const POST = async (req) => {
  try {
    await connect();
    const { userProfileId, userWhofollowsId } = await req.json();

    console.log('Fetching user who follows with ID:', userWhofollowsId);
    const userWhoFollows = await User.findById(userWhofollowsId);

    if (!userWhoFollows) {
      console.error('User who follows not found in the db');
      return new Response(
        JSON.stringify({ error: 'User who follows not found in the db' }),
        { status: 404 }
      );
    }

    console.log('Fetching user to follow with ID:', userProfileId);
    const userToFollow = await User.findById(userProfileId);

    if (!userToFollow) {
      console.error('User to follow not found in the db');
      return new Response(
        JSON.stringify({ error: 'User to follow not found in the db' }),
        { status: 404 }
      );
    }

    const isFollowing = userWhoFollows.following.includes(userProfileId);

    if (isFollowing) {
      // Unfollow logic
      userWhoFollows.following = userWhoFollows.following.filter(
        (id) => id.toString() !== userProfileId
      );
      userToFollow.followers = userToFollow.followers.filter(
        (id) => id.toString() !== userWhofollowsId
      );
    } else {
      // Follow logic
      userWhoFollows.following.push(userProfileId);
      userToFollow.followers.push(userWhofollowsId);
    }

    await Promise.all([userWhoFollows.save(), userToFollow.save()]);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error in follow route:', error.stack);
    return new Response(
      JSON.stringify({ error: 'Failed to follow/unfollow user' }),
      { status: 500 }
    );
  }
};