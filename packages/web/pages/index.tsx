import { isHotkey } from 'is-hotkey';
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
    completed: boolean;
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
        data: { completed: false },
        nodes: [
          {
            leaves: [
              {
                // Because autoFocus does not work.
                text: 'Click me.',
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

const toggleCompleted = (
  editor: RenderNodeProps['editor'],
  node: RenderNodeProps['node'],
  completed: boolean,
) => {
  // @ts-ignore Probably wrong type definition.
  editor.setNodeByKey(node.key, { data: { completed } });
};

const TaskItem: React.FunctionComponent<RenderNodeProps> = props => {
  const { theme } = useAppContext();
  const completed = props.node.data.get('completed');

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    toggleCompleted(props.editor, props.node, event.target.checked);
  };

  return (
    <View {...props.attributes} style={theme.taskItem}>
      <View style={theme.taskItemCheckboxWrapper}>
        <div contentEditable={false}>
          <Input
            // @ts-ignore TODO: replace style prop with RN type.
            style={theme.taskItemCheckbox}
            type="checkbox"
            checked={completed}
            onChange={handleCheckboxChange}
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

  // TODO: Autofucus or restore previous focus. But focus() throws
  // IndexSizeError: Failed to execute 'getRangeAt' on 'Selection': 0 is not a valid index.
  // on hot reload and maybe on something else, hmm.
  // React.useEffect(() => {
  //   if (!editorRef.current) return;
  //   if (editorRef.current.value.selection.isFocused) return;
  //   editorRef.current.focus();
  // }, [editorRef.current]);

  const handleEditorChange = ({ value }: { value: Value }) => {
    setEditorValue(value);
  };

  const handleKeyDown = (event: any, editor: CoreEditor, next: () => any) => {
    if (isHotkey('opt+enter')(event)) {
      event.preventDefault();
      // tslint:disable-next-line:no-console
      const { path } = editor.value.selection.focus;
      if (path == null) return;
      const node = editor.value.document.getParent(path);
      // @ts-ignore TODO: Should be checked probably.
      const completed = node.data.get('completed');
      // @ts-ignore TODO: Should be checked probably.
      toggleCompleted(editor, node, !completed);
      return;
    }
    return next();
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
        // autoFocus // Does not work and we want to restore previous focus anyway.
        onChange={handleEditorChange}
        onKeyDown={handleKeyDown}
        ref={editorRef}
        renderNode={renderNode}
        spellCheck={false}
        value={editorValue}
      />
    </Layout>
  );
};

export default Index;
