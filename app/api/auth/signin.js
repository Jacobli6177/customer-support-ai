// pages/auth/signin.js
import { getProviders, signIn } from 'next-auth/react';
import { Button, Typography } from '@mui/material';

export default function SignIn({ providers }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Sign in to access Gemini Chat
      </Typography>
      {Object.values(providers).map((provider) => (
        <div key={provider.name} style={{ margin: '10px' }}>
          <Button variant="contained" onClick={() => signIn(provider.id)}>
            Sign in with {provider.name}
          </Button>
        </div>
      ))}
    </div>
  );
}

export async function getServerSideProps() {
  const providers = await getProviders();
  return {
    props: { providers },
  };
}
