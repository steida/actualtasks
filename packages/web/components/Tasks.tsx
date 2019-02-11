import { isHotkey } from 'is-hotkey';
import React from 'react';
import { RegisteredStyle, Text, View, ViewStyle } from 'react-native';
// @ts-ignore
import { createElement } from 'react-native-web';
import {
  Editor as CoreEditor,
  KeyUtils,
  // Point,
  Value,
} from 'slate';
import { Editor, RenderNodeProps } from 'slate-react';
import { Overwrite } from 'utility-types';
import useAppContext from '../hooks/useAppContext';
import useLocalStorage, { TaskData, taskType } from '../hooks/useLocalStorage';

type CheckboxProps = Overwrite<
  React.InputHTMLAttributes<HTMLInputElement>,
  { style: RegisteredStyle<ViewStyle> }
>;

const Checkbox = (props: CheckboxProps) =>
  createElement('input', { ...props, type: 'checkbox' });

const getNodeData = (node: RenderNodeProps['node']): TaskData => {
  // data.toJS is costly and we don't need it anyway.
  // This is simple type safe approach.
  const completed = 'completed';
  const depth = 'depth';
  return {
    [completed]: node.data.get(completed),
    [depth]: node.data.get(depth),
  };
};

const setNodeData = (
  editor: RenderNodeProps['editor'],
  nodeKey: string,
  data: TaskData,
) => {
  // @ts-ignore Wrong type definition.
  editor.setNodeByKey(nodeKey, { data });
};

const Task: React.FunctionComponent<RenderNodeProps> = props => {
  const { theme } = useAppContext();
  const data = getNodeData(props.node);
  // Inline functions are ok.
  // https://reactjs.org/docs/hooks-faq.html#are-hooks-slow-because-of-creating-functions-in-render
  const getTaskDepthStyle = () => {
    switch (data.depth) {
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
    setNodeData(props.editor, props.node.key, {
      ...data,
      completed: event.target.checked,
    });
  };

  return (
    <View {...props.attributes} style={[theme.task, depthStyle]}>
      <View style={theme.taskCheckboxWrapper}>
        <div contentEditable={false}>
          <Checkbox
            style={theme.taskCheckbox}
            checked={data.completed}
            onChange={handleCheckboxChange}
          />
        </div>
      </View>
      <Text style={[theme.text, data.completed && theme.lineThrough]}>
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
    // TODO: Throttle because of costly .toJSON
    setTasks(value.toJSON() as any);
  };

  const handleKeyDown = (event: any, editor: CoreEditor, next: () => any) => {
    const getSelectedTasks = () => {
      const tasks: Array<{ key: string } & TaskData> = [];
      editor.value.blocks.forEach(node => {
        if (node == null) return;
        tasks.push({
          key: node.key,
          ...getNodeData(node),
        });
      });
      return tasks;
    };

    if (isHotkey('opt+enter')(event)) {
      event.preventDefault();
      const tasks = getSelectedTasks();
      const allCompleted = !tasks.some(task => !task.completed);
      const completed = allCompleted ? false : true;
      tasks.forEach(task => {
        const { key, ...data } = task;
        setNodeData(editor, key, { ...data, completed });
      });
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
