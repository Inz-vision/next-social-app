import mongoose from 'mongoose';
import Post from '../../../../lib/models/post.model.js';
import { connect } from '../../../../lib/mongodb/mongoose.js';
import { currentUser } from '@clerk/nextjs/server';

export const POST = async (req) => {
  const user = await currentUser();
  try {
    await connect();
    const data = await req.json();

    if (!user || user.publicMetadata.userMongoId !== data.userMongoId) {
      return new Response('Unauthorized', {
        status: 401,
      });
    }

    // Validate and convert userMongoId to ObjectId
    if (!mongoose.Types.ObjectId.isValid(data.userMongoId)) {
      return new Response('Invalid userMongoId', {
        status: 400,
      });
    }
    const userObjectId = new mongoose.Types.ObjectId(data.userMongoId);

    const newPost = await Post.create({
      user: userObjectId, // Use ObjectId here
      name: data.name,
      username: data.username,
      text: data.text,
      profileImg: data.profileImg,
      image: data.image,
    });

    await newPost.save();
    return new Response(JSON.stringify(newPost), {
      status: 200,
    });
  } catch (error) {
    console.log('Error creating post:', error);
    return new Response('Error creating post', {
      status: 500,
    });
  }
};