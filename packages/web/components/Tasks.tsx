import { isHotkey } from 'is-hotkey';
import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
// @ts-ignore
import { createElement } from 'react-native-web';
import { Editor as CoreEditor, KeyUtils, Value } from 'slate';
import { Editor, RenderNodeProps } from 'slate-react';
import { Overwrite } from 'utility-types';
import { LayoutContext } from '../components/Layout';
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

type Node = RenderNodeProps['node'];

// Slate key is an implementation detail. It does not belong to TaskData
// unless we will generate guids.
type TaskDataWithKey = { key: string } & TaskData;

const nodeToTaskDataWithKey = (node: Node): TaskDataWithKey => ({
  key: node.key,
  ...getTaskData(node),
});

const Checkbox = (props: CheckboxProps) =>
  createElement('input', { ...props, type: 'checkbox' });

// getNodeDataProp is probably micro-optimization.
const getTaskData = (node: Node): TaskData => {
  // data.toJS is costly and we don't need it anyway.
  // This is simple type safe approach.
  const completed = 'completed';
  const depth = 'depth';
  return {
    [completed]: node.data.get(completed),
    [depth]: node.data.get(depth),
  };
};

type TaskProps = RenderNodeProps & {
  onCheckboxChange: (node: Node) => void;
};

const Task: React.FunctionComponent<TaskProps> = props => {
  const { theme } = useAppContext();
  const data = getTaskData(props.node);
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
            onChange={() => props.onCheckboxChange(props.node)}
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
  const [storageTasks, setStorageTasks] = useLocalStorage('tasks', true);
  const { focusHeader } = React.useContext(LayoutContext);

  const initialState = () => {
    // For SSR.
    KeyUtils.resetGenerator();
    return Value.fromJSON(storageTasks as any);
  };

  const [editorValue, setEditorValue] = React.useState<Value>(initialState);
  React.useEffect(() => {
    setEditorValue(initialState());
  }, [storageTasks]);

  const editorRef = React.useRef<Editor>(null);

  const getEditor = () => {
    const { current } = editorRef;
    if (current == null) throw new Error('editorRef current is null');
    return current;
  };

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
    // TODO: Throttle because of costly .toJSON. PR anyone?
    setStorageTasks(value.toJSON() as any);
  };

  const getSelectedTasks = (): TaskDataWithKey[] => {
    const selectedTasks: TaskDataWithKey[] = [];
    const editor = getEditor();
    editor.value.blocks.forEach(node => {
      if (node == null || node.type !== taskType) return;
      selectedTasks.push(nodeToTaskDataWithKey(node));
    });
    return selectedTasks;
  };

  const setNodesData = (tasks: TaskDataWithKey[]) => {
    const editor = getEditor();
    tasks.forEach(task => {
      const { key, ...data } = task;
      editor.setNodeByKey(
        key,
        // @ts-ignore Wrong type definition.
        { data },
      );
    });
  };

  const getTaskIndex = (key: string): number => {
    const editor = getEditor();
    return editor.value.document.nodes.findIndex(
      node => node != null && node.key === key,
    );
  };

  const withChildren = (callback: (tasks: TaskDataWithKey[]) => void) => (
    tasks: TaskDataWithKey[],
  ) => {
    // Ensure dedupe via Map.
    const map: Map<string, TaskDataWithKey> = new Map();
    tasks.forEach(task => map.set(task.key, task));

    const getTaskChildren = (task: TaskDataWithKey): TaskDataWithKey[] => {
      const editor = getEditor();
      const children: TaskDataWithKey[] = [];
      const { nodes } = editor.value.document;
      let index = getTaskIndex(task.key);
      // https://twitter.com/estejs/status/1095489649424908288
      while (true) {
        index++;
        const next = nodes.get(index);
        if (next == null) break;
        const data = getTaskData(next);
        if (data.depth <= task.depth) break;
        children.push({ ...data, key: next.key });
      }
      return children;
    };

    tasks.forEach(task => {
      getTaskChildren(task).forEach(child => {
        if (map.has(child.key)) return;
        map.set(child.key, child);
      });
    });

    callback([...map.values()]);
  };

  const toggleTasks = withChildren((tasks: TaskDataWithKey[]) => {
    const allCompleted = !tasks.some(task => !task.completed);
    const completedTasks = tasks.map(task => ({
      ...task,
      completed: allCompleted ? false : true,
    }));
    setNodesData(completedTasks);
  });

  const handleKeyDown: KeyboardEventHook = (event, editor, next) => {
    if (isHotkey('alt+enter')(event)) {
      event.preventDefault();
      toggleTasks(getSelectedTasks());
      return;
    }

    const isTab = isHotkey('tab')(event);
    const isShiftTab = isHotkey('shift+tab')(event);
    if (isTab || isShiftTab) {
      const tasks = getSelectedTasks();
      if (tasks.length === null) return next();
      const canTab = () => {
        const taskIndex = getTaskIndex(tasks[0].key);
        if (taskIndex === 0) return false;
        const previous = editor.value.document.nodes.get(taskIndex - 1);
        if (previous == null) return false;
        const previousDepth = getTaskData(previous).depth;
        const firstDepth = tasks[0].depth;
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
      setNodesData(changedTasks);
      return;
    }

    const metaUp = isHotkey('meta+up')(event);
    const metaDown = isHotkey('meta+down')(event);
    if (metaUp || metaDown) {
      event.preventDefault();
      // const { blocks } = getSelected();
      // const currentIndex = blocks.
      return;
      // jak zjistim indexy? hejbat jednim?
      // kazdej proste presunout? hmm, asi jo!
      // drzet se stejneho depth?
      // editor.moveNodeByKey(key, newKey, newIndex)
    }

    switch (event.key) {
      case 'Escape': {
        focusHeader();
        event.preventDefault();
        return;
      }
    }

    return next();
  };

  const handleTaskCheckboxChange = (node: Node) => {
    toggleTasks([nodeToTaskDataWithKey(node)]);
  };

  const renderNode = (
    props: RenderNodeProps,
    _editor: CoreEditor,
    next: () => any,
  ) => {
    switch (props.node.type) {
      case taskType:
        return <Task {...props} onCheckboxChange={handleTaskCheckboxChange} />;
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
