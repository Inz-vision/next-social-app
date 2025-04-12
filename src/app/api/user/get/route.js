import User from '../../../../lib/models/user.model';
import { connect } from '../../../../lib/mongodb/mongoose';

export const POST = async (req) => {
  try {
    await connect();
    const { username } = await req.json();

    console.log('Fetching user with username:', username);

    const user = await User.findOne({ username });

    if (!user) {
      console.error('User not found for username:', username);
      return new Response(JSON.stringify(null), { status: 404 });
    }

    console.log('Found User:', user);

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return new Response('Error fetching user', { status: 500 });
  }
};