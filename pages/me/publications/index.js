import Layout from '@components/layouts/Layout';
import Post from '@components/ui/Post';
import prisma from '@lib/prisma';
import { getSession, useSession, signIn } from 'next-auth/react';

export default function Publications({ publications }) {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      signIn();
    },
  });

  if (status === 'loading') return null;

  return (
    <main className='container'>
      <h1>Publications</h1>
      {publications.map((publication) => (
        <Post post={publication} key={publication.id} />
      ))}
    </main>
  );
}

export const getServerSideProps = async ({ req, res }) => {
  const session = await getSession({ req });

  if (!session) {
    res.statusCode = 403;
    return { props: { publication: [] } };
  }

  const publications = await prisma.post.findMany({
    where: {
      author: { username: session.user.username },
      published: true,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  publications.forEach((publication) => {
    publication.createdAt = String(publication.createdAt);
    publication.updatedAt = String(publication.updatedAt);
  });

  return {
    props: { publications },
  };
};

Publications.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};