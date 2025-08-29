import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function UploadScreen() {
  const router = useRouter();

  useEffect(() => {
    // Immediately redirect to upload flow
    router.replace('/upload');
  }, []);

  return null;
}