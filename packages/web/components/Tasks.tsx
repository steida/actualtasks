import { isHotkey } from 'is-hotkey';
import React from 'react';
import { RegisteredStyle, Text, View, ViewStyle } from 'react-native';
// @ts-ignore
import { createElement } from 'react-native-web';
import { Editor as CoreEditor, KeyUtils, Value } from 'slate';
import { Editor, RenderNodeProps } from 'slate-react';
import { Overwrite } from 'utility-types';
import useAppContext from '../hooks/useAppContext';
import useLocalStorage, { taskType } from '../hooks/useLocalStorage';

type CheckboxProps = Overwrite<
  React.InputHTMLAttributes<HTMLInputElement>,
  { style: RegisteredStyle<ViewStyle> }
>;

const Checkbox = (props: CheckboxProps) =>
  createElement('input', { ...props, type: 'checkbox' });

const toggleCompleted = (
  editor: RenderNodeProps['editor'],
  node: RenderNodeProps['node'],
  completed: boolean,
) => {
  // @ts-ignore Probably wrong type definition.
  editor.setNodeByKey(node.key, { data: { completed } });
};

const Task: React.FunctionComponent<RenderNodeProps> = props => {
  const { theme } = useAppContext();
  // TODO: Node data should be typed.
  const { data } = props.node;
  const completed: boolean = data.get('completed');

  // For example, the depth is a new prop. Btw yes, it's ok to have inline functions.
  const getTaskDepthStyle = (): RegisteredStyle<ViewStyle> => {
    switch (data.get('depth')) {
      case 0:
        return theme.taskDepth0;
      case 1:
        return theme.taskDepth1;
      case 2:
        return theme.taskDepth2;
      case 3:
        return theme.taskDepth3;
      case 4:
        return theme.taskDepth4;
      case 5:
        return theme.taskDepth5;
      case 6:
        return theme.taskDepth6;
      case 7:
        return theme.taskDepth7;
      case 8:
        return theme.taskDepth8;
      case 9:
        return theme.taskDepth9;
      default:
        return theme.taskDepth0;
    }
  };
  const depthStyle = getTaskDepthStyle();

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    toggleCompleted(props.editor, props.node, event.target.checked);
  };

  return (
    <View {...props.attributes} style={[theme.task, depthStyle]}>
      <View style={theme.taskCheckboxWrapper}>
        <div contentEditable={false}>
          <Checkbox
            style={theme.taskCheckbox}
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

const Tasks: React.FunctionComponent = () => {
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
      case taskType:
        return <Task {...props} />;
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

export default Tasks;
