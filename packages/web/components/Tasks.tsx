import { isHotkey } from 'is-hotkey';
import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
// @ts-ignore
import { createElement } from 'react-native-web';
import { Block, Editor as CoreEditor, KeyUtils, Value } from 'slate';
import { Editor, RenderNodeProps } from 'slate-react';
import { Overwrite } from 'utility-types';
import useAppContext from '../hooks/useAppContext';
import useLocalStorage, { TaskData, taskType } from '../hooks/useLocalStorage';

type KeyboardEventHook = (
  event: KeyboardEvent,
  editor: CoreEditor,
  next: () => any,
) => void;

type CheckboxProps = Overwrite<
  React.InputHTMLAttributes<HTMLInputElement>,
  { style: StyleProp<ViewStyle> }
>;

const Checkbox = (props: CheckboxProps) =>
  createElement('input', { ...props, type: 'checkbox' });

type Node = RenderNodeProps['node'];

const getNodeData = (node: Node): TaskData => {
  // data.toJS is costly and we don't need it anyway.
  // This is simple type safe approach.
  const completed = 'completed';
  const depth = 'depth';
  return {
    [completed]: node.data.get(completed),
    [depth]: node.data.get(depth),
  };
};

// Slate key is an implementation detail. It does not belong to TaskData.
type SlateKey = string;
type TaskDataWithKey = { key: SlateKey } & TaskData;

const setNodeData = (editor: CoreEditor, nodeKey: string, data: TaskData) => {
  // @ts-ignore Wrong type definition.
  editor.setNodeByKey(nodeKey, { data });
};

const setNodesData = (editor: CoreEditor, tasks: TaskDataWithKey[]) => {
  tasks.forEach(task => {
    const { key, ...data } = task;
    setNodeData(editor, key, data);
  });
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
    }
    return data.depth < 0 ? theme.taskDepth0 : theme.taskDepth9;
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
            style={[
              theme.taskCheckbox,
              data.completed && theme.taskCheckboxCompleted,
            ]}
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

  const handleKeyDown: KeyboardEventHook = (event, editor, next) => {
    const getSelected = () => {
      const blocks: Block[] = [];
      const tasks: TaskDataWithKey[] = [];
      editor.value.blocks.forEach(node => {
        if (node == null || node.type !== taskType) return;
        blocks.push(node);
        tasks.push({
          key: node.key,
          ...getNodeData(node),
        });
      });
      return { blocks, tasks };
    };

    if (isHotkey('opt+enter')(event)) {
      event.preventDefault();
      const tasks = getSelected().tasks;
      const allCompleted = !tasks.some(task => !task.completed);
      const completedTasks = tasks.map(task => ({
        ...task,
        completed: allCompleted ? false : true,
      }));
      setNodesData(editor, completedTasks);
      return;
    }

    const isTab = isHotkey('tab')(event);
    const isShiftTab = isHotkey('shift+tab')(event);
    if (isTab || isShiftTab) {
      const { tasks, blocks } = getSelected();
      if (tasks.length === null) return next();
      const canTab = () => {
        const previous = editor.value.document.getPreviousBlock(tasks[0].key);
        if (previous == null) return false;
        const previousDepth = getNodeData(previous).depth;
        const firstDepth = getNodeData(blocks[0]).depth;
        return firstDepth <= previousDepth;
      };
      const canShiftTab = () => !tasks.some(task => task.depth === 0);
      const canChangeDepth = isTab ? canTab() : canShiftTab();
      if (!canChangeDepth) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      const changedTasks = tasks.map(task => ({
        ...task,
        depth: task.depth + (isTab ? 1 : -1),
      }));
      setNodesData(editor, changedTasks);
      return;
    }

    switch (event.key) {
      case 'Escape': {
        const focusable: HTMLElement | null = document.querySelector(
          '[data-focusable',
        );
        if (focusable) focusable.focus();
      }
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
      // @ts-ignore Type definitions bug.
      onKeyDown={handleKeyDown}
      ref={editorRef}
      renderNode={renderNode}
      spellCheck={false}
      value={editorValue}
    />
  );
};

export default Tasks;
