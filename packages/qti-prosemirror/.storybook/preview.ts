import '../src';

// eslint-disable-next-line import/no-relative-packages
import '../../../packages/qti-theme/src/item.css';
import './styles.css';

export const parameters = {
  docs: {
    extractComponentDescription: (component: any, { notes }: any) => {
      if (notes) {
        return typeof notes === 'string' ? notes : notes.markdown || notes.text;
      }
      return null;
    }
  }
};

export const tags = ['autodocs'];
