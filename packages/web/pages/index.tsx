import React from 'react';
import { Text, View } from 'react-native';
// @ts-ignore
import { createElement } from 'react-native-web';
import { Editor as CoreEditor, KeyUtils, Value } from 'slate';
import { Editor, RenderNodeProps } from 'slate-react';
import Layout from '../components/Layout';
import useAppContext from '../hooks/useAppContext';
import { pageTitles } from './_app';

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) =>
  createElement('input', props);

const taskItemType = 'task-item';

interface TaskText {
  leaves: Array<{ text: string }>;
  object: 'text';
}

interface TaskItem {
  data: {
    checked: boolean;
  };
  nodes: TaskText[];
  object: 'block';
  type: typeof taskItemType;
}

interface TasksValue {
  document: {
    nodes: TaskItem[];
  };
}

const initialValue: TasksValue = {
  document: {
    nodes: [
      {
        data: { checked: false },
        nodes: [
          {
            leaves: [
              {
                text: 'Test',
              },
            ],
            object: 'text',
          },
        ],
        object: 'block',
        type: 'task-item',
      },
    ],
  },
};

interface TaskItemProps {
  attributes: any;
  children: any;
  node: any;
}

const TaskItem: React.FunctionComponent<TaskItemProps> = props => {
  const { theme } = useAppContext();
  const checked = props.node.data.get('checked');

  const handleChange = () => {
    // event: React.ChangeEvent<HTMLInputElement>
  };

  return (
    <View {...props.attributes} style={theme.taskItem}>
      <View style={theme.taskItemCheckboxWrapper}>
        <div contentEditable={false}>
          <Input
            // @ts-ignore TODO: replace style prop with RN type.
            style={theme.taskItemCheckbox}
            type="checkbox"
            checked={checked}
            onChange={handleChange}
          />
        </div>
      </View>
      <Text style={theme.text}>{props.children}</Text>
    </View>
  );
};

const Index: React.FunctionComponent = () => {
  const { intl } = useAppContext();
  const title = intl.formatMessage(pageTitles.index);
  const [editorValue, setEditorValue] = React.useState<Value>(() => {
    // For SSR.
    KeyUtils.resetGenerator();
    return Value.fromJSON(initialValue as any); // We have more specific type.
  });
  const editorRef = React.useRef<Editor>(null);

  const onEditorChange = ({ value }: { value: Value }) => {
    setEditorValue(value);
  };

  const renderNode = (
    props: RenderNodeProps,
    _editor: CoreEditor,
    next: () => any,
  ) => {
    switch (props.node.type) {
      case taskItemType:
        return <TaskItem {...props} />;
      default:
        return next();
    }
  };

  return (
    <Layout title={title}>
      <Editor
        autoCorrect={false}
        spellCheck={false}
        value={editorValue}
        onChange={onEditorChange}
        ref={editorRef}
        // onKeyDown={this.onKeyDown}
        renderNode={renderNode}
      />
    </Layout>
  );
};

export default Index;
