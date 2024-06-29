import {
  Field,
  FieldArray,
  FieldProps,
  Form,
  Formik,
  FormikErrors,
} from 'formik';
import { useState } from 'react';
import { BsFloppyFill } from 'react-icons/bs';
import { Link } from 'react-router-dom';

import { MinusIcon } from '@chakra-ui/icons';
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
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';

import { SEARCH_REPLACEMENT } from '../lib/constants';
import { Route, RouteType } from '../lib/types';
import { mapSubroutes, unmapSubroutes } from '../utils/general';

type RouteFromType = Omit<Route, 'isValue' | 'routeType' | 'subRoutes'> & {
  subRoutes: {
    command: string;
    url: string;
  }[];
};

type RouteFormProps = {
  route: Partial<Route>;
  cancel?: {
    text: string;
    onClick: () => void;
    isLoading: boolean;
  };
  onSubmit: (route: Route) => Promise<void>;
  disabledFields?: Array<keyof Route>;
  disabled?: boolean;
};

export function RouteForm({
  route,
  cancel,
  onSubmit,
  disabledFields,
  disabled,
}: RouteFormProps) {
  const [formError, setFormError] = useState<Error | undefined>(undefined);
  const validation = {
    name: (name: string) => {
      if (!name || name === '') {
        return 'name is required';
      }
      return undefined;
    },
    command: (command: string) => {
      if (!command || command === '') {
        return 'command is required';
      }
      return undefined;
    },
    url: (url: string) => {
      if (!url || url === '') {
        return 'url is required';
      }
      // check if url is valid format
      if (url.match(/^(http|https):\/\/[^ "]+$/) === null) {
        return 'url is invalid';
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
        subRoutes: mapSubroutes(route.subRoutes ?? []),
      }}
      onSubmit={(values: RouteFromType, actions) => {
        actions.setSubmitting(true);
        setFormError(undefined);
        onSubmit({
          ...values,
          subRoutes: unmapSubroutes(values.subRoutes),
          routeType: RouteType.MANUAL,
          isValue: true,
        }).finally(() => {
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
            width: '100%',
          }}
        >
          <Field name="command" validate={validation.command}>
            {({ field, form }: FieldProps) => (
              <FormControl
                isRequired
                isInvalid={!!(form.touched.command && form.errors.command)}
                isDisabled={disabledFields?.includes('command')}
              >
                <FormLabel>command</FormLabel>
                <FormHelperText marginBottom="5px">
                  command to trigger the route
                </FormHelperText>
                <Input {...field} placeholder="ga" />
                <FormErrorMessage>
                  {form.errors.command?.toString()}
                </FormErrorMessage>
              </FormControl>
            )}
          </Field>
          <Field name="name" validate={validation.name}>
            {({ field, form }: FieldProps) => (
              <FormControl
                isRequired
                isInvalid={!!(form.touched.name && form.errors.name)}
                isDisabled={disabledFields?.includes('name')}
              >
                <FormLabel>name</FormLabel>
                <FormHelperText marginBottom="5px">
                  name of the route you are creating
                </FormHelperText>
                <Input {...field} placeholder="Google Anime Search" />
                <FormErrorMessage>
                  {form.errors.name?.toString()}
                </FormErrorMessage>
              </FormControl>
            )}
          </Field>
          <Field name="url" validate={validation.url}>
            {({ field, form }: FieldProps) => (
              <FormControl
                isRequired
                isInvalid={!!(form.touched.url && form.errors.url)}
                isDisabled={disabledFields?.includes('url')}
              >
                <FormLabel>url</FormLabel>
                <FormHelperText marginBottom="5px">
                  optionally add {SEARCH_REPLACEMENT} to allow for the text
                  after the command to populate the url&apos;s search query.
                </FormHelperText>
                <Input
                  {...field}
                  placeholder={`https://www.google.com/search?q=anime+${SEARCH_REPLACEMENT}`}
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
                <FormLabel>description</FormLabel>
                <FormHelperText marginBottom="5px">
                  description of the route, feel free to add examples.{' '}
                  <Link
                    target="_blank"
                    to="https://www.markdownguide.org/cheat-sheet/"
                  >
                    <Box as="span" textDecor="underline">
                      supports Markdown
                    </Box>
                  </Link>
                </FormHelperText>
                <Textarea
                  {...field}
                  placeholder={
                    'Searches Google for the best anime e.g. Naruto. ' +
                    'Simply type `ga Naruto`'
                  }
                />
              </FormControl>
            )}
          </Field>
          <FieldArray
            name="subRoutes"
            render={(arrayHelpers) => (
              <VStack alignItems="flex-start" gap={3}>
                {props.values.subRoutes?.map((data, index) => {
                  const touched = (props.touched.subRoutes || [])[index];
                  const ne =
                    props.errors.subRoutes?.[index] ??
                    ({} as FormikErrors<Route>);
                  const error =
                    typeof ne === 'string' ? { command: ne, url: ne } : ne;
                  const currentError: string | undefined =
                    error.command || error.url;
                  const wasTouched = touched?.command && touched?.url;
                  return (
                    <Box as="span" key={data.command} width="100%">
                      <HStack gap={2}>
                        <Field
                          name={`subRoutes.${index}.command`}
                          validate={validation.command}
                        >
                          {({ field }: FieldProps) => (
                            <FormControl
                              width="50%"
                              isRequired
                              isInvalid={!!(touched && error.command)}
                              isDisabled={disabledFields?.includes('subRoutes')}
                            >
                              {index === 0 && (
                                <FormLabel marginBottom={2}>
                                  subcommand
                                </FormLabel>
                              )}
                              <Input {...field} placeholder="db" />
                            </FormControl>
                          )}
                        </Field>
                        <Field
                          name={`subRoutes.${index}.url`}
                          validate={validation.url}
                        >
                          {({ field }: FieldProps) => (
                            <FormControl
                              isRequired
                              isInvalid={!!(touched && error.url)}
                              isDisabled={disabledFields?.includes('subRoutes')}
                            >
                              {index === 0 && (
                                <FormLabel marginBottom={2}>url</FormLabel>
                              )}
                              <Input
                                {...field}
                                placeholder={`https://g.com/s?q=anime+db+${SEARCH_REPLACEMENT}`}
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
                  add subroute
                </Button>
              </VStack>
            )}
          />
          <HStack alignItems="center" mt={4} gap={4}>
            <Button
              isLoading={props.isSubmitting}
              type="submit"
              leftIcon={<BsFloppyFill />}
              colorScheme="blue"
              isDisabled={disabled}
              flexGrow={1}
            >
              save
            </Button>
            {cancel && (
              <Button
                onClick={cancel.onClick}
                colorScheme="gray"
                flexGrow={1}
                isLoading={cancel.isLoading}
              >
                {cancel.text}
              </Button>
            )}
          </HStack>
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
