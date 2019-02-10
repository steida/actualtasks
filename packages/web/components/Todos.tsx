import { isHotkey } from 'is-hotkey';
import React from 'react';
import { RegisteredStyle, Text, View, ViewStyle } from 'react-native';
// @ts-ignore
import { createElement } from 'react-native-web';
import { Editor as CoreEditor, KeyUtils, Value } from 'slate';
import { Editor, RenderNodeProps } from 'slate-react';
import useAppContext from '../hooks/useAppContext';
import useLocalStorage, { taskItemType } from '../hooks/useLocalStorage';

const Checkbox = (props: React.InputHTMLAttributes<HTMLInputElement>) =>
  createElement('input', { ...props, type: 'checkbox' });

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
  // TODO: Node data should be typed, but it can and will be runtime changed.
  // Use localStorage migration via https://github.com/gcanti/io-ts?
  // Use fail-safe GraphQL versionless approach for now.
  const { data } = props.node;
  const completed: boolean = data.get('completed');

  // For example, the depth is a new prop. Btw yes, it's ok to have inline functions.
  const getDepthStyle = (): RegisteredStyle<ViewStyle> => {
    switch (data.get('depth')) {
      case 0:
        return theme.taskItemDepth0;
      case 1:
        return theme.taskItemDepth1;
      case 2:
        return theme.taskItemDepth2;
      case 3:
        return theme.taskItemDepth3;
      case 4:
        return theme.taskItemDepth4;
      case 5:
        return theme.taskItemDepth5;
      case 6:
        return theme.taskItemDepth6;
      case 7:
        return theme.taskItemDepth7;
      case 8:
        return theme.taskItemDepth8;
      case 9:
        return theme.taskItemDepth9;
      default:
        return theme.taskItemDepth0;
    }
  };
  const depthStyle = getDepthStyle();

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    toggleCompleted(props.editor, props.node, event.target.checked);
  };

  return (
    <View {...props.attributes} style={[theme.taskItem, depthStyle]}>
      <View style={theme.taskItemCheckboxWrapper}>
        <div contentEditable={false}>
          <Checkbox
            // @ts-ignore TODO: replace style prop with RN type.
            style={theme.taskItemCheckbox}
            checked={completed}
            onChange={handleCheckboxChange}
          />
        </div>
      </View>
      <Text style={[theme.text, completed && theme.lineThrough]}>
        {props.children}
      </Text>
    </View>
  );
};

const Todos: React.FunctionComponent = () => {
  const [tasks, setTasks] = useLocalStorage('tasks', true);

  const initialState = () => {
    // For SSR.
    KeyUtils.resetGenerator();
    return Value.fromJSON(tasks as any);
  };

  const [editorValue, setEditorValue] = React.useState<Value>(initialState);
  React.useEffect(() => {
    setEditorValue(initialState());
  }, [tasks]);

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
    setTasks(value.toJSON() as any);
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
  );
};

export default Todos;
