import { Comment } from '../models/Comment.js';
import { Post } from '../models/Post.js';
import { User, UserDocument } from '../models/User.js';

const demoPassword = 'demo123';

const demoUsers = [
  {
    name: 'Aarav Sharma',
    email: 'aarav.demo@anchors.local',
    bio: 'Frontend developer sharing product ideas and UI inspiration.',
  },
  {
    name: 'Meera Nair',
    email: 'meera.demo@anchors.local',
    bio: 'Student builder posting learning notes and campus updates.',
  },
  {
    name: 'Kabir Khan',
    email: 'kabir.demo@anchors.local',
    bio: 'Backend engineer interested in APIs, databases, and clean systems.',
  },
  {
    name: 'Riya Sen',
    email: 'riya.demo@anchors.local',
    bio: 'Community moderator collecting useful resources for everyone.',
  },
  {
    name: 'Dev Patel',
    email: 'dev.demo@anchors.local',
    bio: 'Full-stack learner documenting projects and bugs fixed.',
  },
  {
    name: 'Nisha Verma',
    email: 'nisha.demo@anchors.local',
    bio: 'Career-focused creator posting interview and placement tips.',
  },
];

const demoPosts = [
  {
    authorEmail: 'aarav.demo@anchors.local',
    title: 'What makes a social feed feel alive?',
    body: 'A good social feed needs fast posting, inline comments, visible profiles, and small feedback loops. The biggest improvement is letting people respond without leaving the feed.',
  },
  {
    authorEmail: 'meera.demo@anchors.local',
    title: 'Best way to prepare for final year project demo',
    body: 'Keep the demo short, explain the problem first, then show the most useful workflow. Screenshots help, but a working flow with real data is much better.',
  },
  {
    authorEmail: 'kabir.demo@anchors.local',
    title: 'MongoDB tip: always validate ids before querying',
    body: 'If an API accepts Mongo ids in params, validate them before calling findById. It keeps errors clean and gives users proper 400 responses.',
  },
  {
    authorEmail: 'riya.demo@anchors.local',
    title: 'Community rule: useful replies should be easy to find',
    body: 'Nested replies are powerful when conversations grow. The UI should make direct answers, follow-up questions, and credit information clear.',
  },
  {
    authorEmail: 'dev.demo@anchors.local',
    title: 'Small bug I fixed today: port already in use',
    body: 'When a dev server says EADDRINUSE, another process is already listening on that port. Find the PID, stop it, or run the app on another port.',
  },
  {
    authorEmail: 'nisha.demo@anchors.local',
    title: 'Placement checklist for web developers',
    body: 'Have one deployed project, explain your backend routes, know auth basics, prepare SQL or Mongo queries, and be ready to debug live.',
  },
  {
    authorEmail: 'aarav.demo@anchors.local',
    title: 'Design note: cards need actions that actually work',
    body: 'If something looks like a button, it should do something. Decorative controls create confusion, especially on dashboards and social feeds.',
  },
  {
    authorEmail: 'meera.demo@anchors.local',
    title: 'How I organize notes for React learning',
    body: 'I keep one section for hooks, one for routing, one for API calls, and one for common errors. Short examples are easier to revise than long theory.',
  },
  {
    authorEmail: 'kabir.demo@anchors.local',
    title: 'Why API error messages matter',
    body: 'A clear error message saves debugging time. Users should know if they are unauthenticated, unauthorized, or sending invalid data.',
  },
  {
    authorEmail: 'riya.demo@anchors.local',
    title: 'Feature request: profile photos everywhere',
    body: 'Profile photos make the app feel personal. They should appear in the navbar, feed cards, dashboard, post details, and comments.',
  },
  {
    authorEmail: 'dev.demo@anchors.local',
    title: 'What should a delete post button do?',
    body: 'It should confirm first, remove the post, remove related comments, update the UI immediately, and keep credits consistent.',
  },
  {
    authorEmail: 'nisha.demo@anchors.local',
    title: 'Interview answer: explain JWT auth simply',
    body: 'The server signs a token after login. The frontend stores it and sends it with API requests. Protected routes verify the token before allowing actions.',
  },
  {
    authorEmail: 'aarav.demo@anchors.local',
    title: 'Dark mode is more than black background',
    body: 'Dark mode needs readable text, softer borders, darker cards, and careful contrast. Only changing the body color is not enough.',
  },
  {
    authorEmail: 'meera.demo@anchors.local',
    title: 'Campus project idea: threaded forum for students',
    body: 'Students can post questions, reply in nested comments, earn credits, and build a visible knowledge base for juniors.',
  },
  {
    authorEmail: 'kabir.demo@anchors.local',
    title: 'Backend checklist before showing a MERN app',
    body: 'Check CORS, env variables, Mongo connection, auth middleware, validation, and production build. Most demo failures come from these areas.',
  },
  {
    authorEmail: 'riya.demo@anchors.local',
    title: 'Make empty states useful',
    body: 'A page with no posts should invite action. A social platform looks better when it starts with sample content and clear next steps.',
  },
  {
    authorEmail: 'dev.demo@anchors.local',
    title: 'Inline comments improve engagement',
    body: 'When users can comment without page navigation, they respond faster. It keeps the feed feeling active and reduces friction.',
  },
  {
    authorEmail: 'nisha.demo@anchors.local',
    title: 'Resume tip: describe impact, not only tech stack',
    body: 'Instead of listing React and Node only, write what the app does, what problem it solves, and what features you implemented.',
  },
];

const demoComments = [
  'This is useful. I would also add screenshots for clarity.',
  'Good point. Keeping the action on the same page makes it feel faster.',
  'I tried this approach and it worked well in my project.',
  'This would be helpful for students preparing demos.',
  'Can you share more details about how you handled the backend?',
];

export async function seedDemoData() {
  const usersByEmail = new Map<string, UserDocument>();

  for (const demoUser of demoUsers) {
    let user = (await User.findOne({ email: demoUser.email })) as UserDocument | null;
    if (!user) {
      user = (await User.create({
        ...demoUser,
        password: demoPassword,
      })) as UserDocument;
    }

    usersByEmail.set(demoUser.email, user);
  }

  const demoUserIds = [...usersByEmail.values()].map((user) => user._id);
  const existingDemoPosts = await Post.countDocuments({ author: { $in: demoUserIds } });
  if (existingDemoPosts >= demoPosts.length) {
    return;
  }

  let createdPostCount = 0;

  for (const [index, demoPost] of demoPosts.entries()) {
    const author = usersByEmail.get(demoPost.authorEmail);
    if (!author) {
      continue;
    }

    const existing = await Post.findOne({ author: author._id, title: demoPost.title });
    if (existing) {
      continue;
    }

    const post = await Post.create({
      title: demoPost.title,
      body: demoPost.body,
      author: author._id,
      imageUrl: '',
    });

    createdPostCount += 1;

    const firstCommentAuthor = demoUserIds[(index + 1) % demoUserIds.length];
    const secondCommentAuthor = demoUserIds[(index + 2) % demoUserIds.length];

    await Comment.create([
      {
        content: demoComments[index % demoComments.length],
        author: firstCommentAuthor,
        post: post._id,
        parentComment: null,
        depth: 1,
        creditAwarded: 1,
      },
      {
        content: demoComments[(index + 2) % demoComments.length],
        author: secondCommentAuthor,
        post: post._id,
        parentComment: null,
        depth: 1,
        creditAwarded: 1,
      },
    ]);

    author.totalCredits += 2;
    await author.save();
  }

  if (createdPostCount > 0) {
    console.log(`Seeded ${createdPostCount} demo posts`);
  }
}
