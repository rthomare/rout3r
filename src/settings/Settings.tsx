import { useState } from 'react';
import { BsFloppyFill } from 'react-icons/bs';

import { Button, Heading, Input, VStack } from '@chakra-ui/react';

import { PageHeader } from '../components/PageHeader';
import { useAppSettings } from '../hooks/useAppSettings';

export function Settings() {
  const { settings, updateSettings } = useAppSettings();
  const [searchFallback, setSearchFallback] = useState(
    settings?.searchFallback
  );
  if (!settings) {
    return null;
  }
  return (
    <VStack alignItems="flex-start">
      <PageHeader>settings</PageHeader>
      <Heading size="sm">fallback url</Heading>
      <Input
        placeholder="enter your fallback search url"
        value={settings?.searchFallback}
        onChange={(e) => setSearchFallback(e.target.value)}
      />
      <Heading size="sm">rpc url</Heading>
      <Input disabled value={settings?.rpc} />
      <Button
        onClick={() =>
          updateSettings({
            ...settings,
            searchFallback: searchFallback ?? settings.searchFallback,
          })
        }
        w="100%"
        type="submit"
        leftIcon={<BsFloppyFill />}
        colorScheme="blue"
        flexGrow={1}
      >
        save
      </Button>
    </VStack>
  );
}
