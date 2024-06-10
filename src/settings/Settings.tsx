import { Button, Heading, Input, VStack } from '@chakra-ui/react';
import { useAppSettings } from '../hooks/useAppSettings';
import { useState } from 'react';
import { BsFloppyFill } from 'react-icons/bs';
import { PageHeader } from '../components/PageHeader';

export function Settings() {
  const { settings, updateSettings } = useAppSettings();
  if (!settings) {
    return null;
  }
  const [searchFallback, setSearchFallback] = useState(settings.searchFallback);
  return (
    <VStack alignItems="flex-start">
      <PageHeader>Settings</PageHeader>
      <Heading size="md">Fallback URL</Heading>
      <Input
        placeholder="Enter your Fallback Search URL"
        value={settings?.searchFallback}
        onChange={(e) => setSearchFallback(e.target.value)}
      />
      <Heading size="md">RPC URL</Heading>
      <Input disabled value={settings?.rpc} />
      <Heading size="md">RPC URL</Heading>
      <Input disabled value={settings?.rpc} />
      <Button
        onClick={() =>
          updateSettings({
            ...settings,
            searchFallback,
          })
        }
        w="100%"
        type="submit"
        leftIcon={<BsFloppyFill />}
        colorScheme="blue"
        flexGrow={1}
      >
        Save
      </Button>
    </VStack>
  );
}
