import axios from 'axios';
import { cookies } from 'next/headers';

export const GET = async () => {
  const cookieStore = cookies();
  const token: string | undefined = cookieStore.get('accessToken')?.value;


  try {
    const response = await axios.get('http://localhost:8080/goal-list/all', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = response.data;

    console.log('helllllllo', data);

    return new Response(JSON.stringify({ data }));
  } catch (error) {
    console.log('errrrrrrr');

    console.log('error', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
};
