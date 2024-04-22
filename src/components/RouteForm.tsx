import { Route, RouteData } from '../lib/types';
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Link,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import {
  Field,
  FieldArray,
  FieldProps,
  Form,
  Formik,
  FormikErrors,
  FormikTouched,
} from 'formik';
import { MinusIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import { BsFloppyFill } from 'react-icons/bs';

type RouteFormProps = {
  route: Partial<Route>;
  disabledFields?: Array<keyof Route>;
  onSubmit: (route: Route) => Promise<void>;
};

export function RouteForm({ route, disabledFields, onSubmit }: RouteFormProps) {
  const [formError, setFormError] = useState<Error | undefined>(undefined);
  const validation = {
    name: (name: string) => {
      if (!name || name === '') {
        return 'Name is required';
      }
      return undefined;
    },
    command: (command: string) => {
      if (!command || command === '') {
        return 'Command is required';
      }
      return undefined;
    },
    url: (url: string) => {
      if (!url || url === '') {
        return 'URL is required';
      }
      // check if url is valid format
      if (url.match(/^(http|https):\/\/[^ "]+$/) === null) {
        return 'URL is invalid';
      }
      return undefined;
    },
  };
  return (
    <Formik
      initialValues={{
        name: route.name || '',
        command: route.command || '',
        url: route.url || '',
        description: route.description || '',
        subRoutes: route.subRoutes || [],
      }}
      onSubmit={(values, actions) => {
        actions.setSubmitting(true);
        setFormError(undefined);
        onSubmit(values as Route)
          .catch((error) => {
            setFormError(error);
          })
          .finally(() => {
            actions.setSubmitting(false);
          });
      }}
    >
      {(props) => (
        <Form
          style={{
            gap: 20,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Field name="command" validate={validation.command}>
            {({ field, form }: FieldProps) => (
              <FormControl
                isRequired={true}
                isInvalid={
                  form.touched.command && form.errors.command ? true : false
                }
                isDisabled={disabledFields?.includes('command')}
              >
                <FormLabel>Command</FormLabel>
                <FormHelperText marginBottom="5px">
                  Command to trigger the route
                </FormHelperText>
                <Input {...field} placeholder="ga" />
                <FormErrorMessage>
                  {form.errors.command?.toString()}
                </FormErrorMessage>
              </FormControl>
            )}
          </Field>
          <Field name="name" validate={validation.name}>
            {({ field, form }: FieldProps) => {
              return (
                <FormControl
                  isRequired={true}
                  isInvalid={
                    form.touched.name && form.errors.name ? true : false
                  }
                  isDisabled={disabledFields?.includes('name')}
                >
                  <FormLabel>Name</FormLabel>
                  <FormHelperText marginBottom="5px">
                    Name of the route you are creating
                  </FormHelperText>
                  <Input {...field} placeholder="Google Anime Search" />
                  <FormErrorMessage>
                    {form.errors.name?.toString()}
                  </FormErrorMessage>
                </FormControl>
              );
            }}
          </Field>
          <Field name="url" validate={validation.url}>
            {({ field, form }: FieldProps) => (
              <FormControl
                isRequired={true}
                isInvalid={form.touched.url && form.errors.url ? true : false}
                isDisabled={disabledFields?.includes('url')}
              >
                <FormLabel>URL</FormLabel>
                <FormHelperText marginBottom="5px">
                  Optionally add %@@@ to allow for the text after the command to
                  populate the url's search query.
                </FormHelperText>
                <Input
                  {...field}
                  placeholder="https://www.google.com/search?q=anime+%@@@"
                />
                <FormErrorMessage>
                  {form.errors.url?.toString()}
                </FormErrorMessage>
              </FormControl>
            )}
          </Field>
          <Field name="description">
            {({ field }: FieldProps) => (
              <FormControl isDisabled={disabledFields?.includes('description')}>
                <FormLabel>Description</FormLabel>
                <FormHelperText marginBottom="5px">
                  Description of the route, feel free to add examples.{' '}
                  <Link
                    textDecoration="underline"
                    target="_blank"
                    href="https://www.markdownguide.org/cheat-sheet/"
                  >
                    Supports Markdown
                  </Link>
                </FormHelperText>
                <Textarea
                  {...field}
                  placeholder="Searches Google for the best anime e.g. Naruto. Simply type `ga Naruto`"
                />
              </FormControl>
            )}
          </Field>
          <FieldArray
            name="subRoutes"
            render={(arrayHelpers) => {
              return (
                <VStack alignItems="flex-start" gap={3}>
                  {props.values.subRoutes?.map((_, index) => {
                    const touched: FormikTouched<RouteData> =
                      props.touched.subRoutes?.[index] ?? {};
                    const ne =
                      props.errors.subRoutes?.[index] ??
                      ({} as FormikErrors<RouteData>);
                    const error =
                      typeof ne === 'string' ? { command: ne, url: ne } : ne;
                    const currentError: string | undefined =
                      error.command || error.url;
                    const wasTouched = touched.command && touched.url;
                    return (
                      <Box as="span" key={index} width="100%">
                        <HStack key={index} gap={2}>
                          <Field
                            name={`subRoutes.${index}.command`}
                            validate={validation.command}
                          >
                            {({ field }: FieldProps) => {
                              return (
                                <FormControl
                                  width="50%"
                                  isRequired={true}
                                  isInvalid={
                                    touched.command && error.command
                                      ? true
                                      : false
                                  }
                                  isDisabled={disabledFields?.includes(
                                    'subRoutes'
                                  )}
                                >
                                  {index === 0 && (
                                    <FormLabel marginBottom={2}>
                                      Subcommand
                                    </FormLabel>
                                  )}
                                  <Input {...field} placeholder="db" />
                                </FormControl>
                              );
                            }}
                          </Field>
                          <Field
                            name={`subRoutes.${index}.url`}
                            validate={validation.url}
                          >
                            {({ field }: FieldProps) => (
                              <FormControl
                                isRequired={true}
                                isInvalid={
                                  touched.url && error.url ? true : false
                                }
                                isDisabled={disabledFields?.includes(
                                  'subRoutes'
                                )}
                              >
                                {index === 0 && (
                                  <FormLabel marginBottom={2}>URL</FormLabel>
                                )}
                                <Input
                                  {...field}
                                  placeholder="https://www.g.com/search?q=anime+db+%@@@"
                                />
                              </FormControl>
                            )}
                          </Field>
                          <Box>
                            {index === 0 && <FormLabel>&nbsp;</FormLabel>}
                            <IconButton
                              icon={<MinusIcon />}
                              aria-label="Remove Subroute"
                              onClick={() => arrayHelpers.remove(index)}
                            />
                          </Box>
                        </HStack>
                        {wasTouched && currentError && (
                          <Text color="red.300">{currentError.toString()}</Text>
                        )}
                      </Box>
                    );
                  })}
                  <Button
                    mt={4}
                    onClick={() => arrayHelpers.push({ command: '', url: '' })}
                    type="submit"
                    isDisabled={disabledFields?.includes('subRoutes')}
                  >
                    + Add a Subroute
                  </Button>
                </VStack>
              );
            }}
          />
          <Button
            mt={4}
            isLoading={props.isSubmitting}
            type="submit"
            leftIcon={<BsFloppyFill />}
            colorScheme="blue"
          >
            Save
          </Button>
          {formError && (
            <Text color="red.300" textAlign="center">
              {formError.message}
            </Text>
          )}
        </Form>
      )}
    </Formik>
  );
}
