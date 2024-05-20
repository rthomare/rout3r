import { CreateStyled } from '@emotion/styled';

export const transientOptions: Parameters<CreateStyled>[1] = {
  shouldForwardProp: (propName: string) => !propName.startsWith('$'),
};

export default transientOptions;

export const IS_FULL_DEV = import.meta.env.VITE_FULL_DEV ? true : false;
