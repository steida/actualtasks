import { TaskList as TaskListType } from '@app/state/types';
import React, {
  FunctionComponent,
  useMemo,
  useReducer,
  Dispatch,
  useCallback,
} from 'react';
import { Editor, RenderNodeProps } from 'slate-react';
import { Editor as CoreEditor, KeyUtils, Value } from 'slate';
// @ts-ignore
import { createElement } from 'react-native-web';
import { Text, View, ViewStyle, StyleProp } from 'react-native';
import { Overwrite } from 'utility-types';
import throttle from 'lodash.throttle';
import useAppContext from '../hooks/useAppContext';
import useAppState from '../hooks/useAppState';
import useScreenSize from '../hooks/useScreenSize';

type TaskType = TaskListType['slate']['document']['nodes'][0];
type TaskTypeTypeProp = TaskType['type'];
type TaskTypeData = TaskType['data'];
// Slate key is an implementation detail. It does not belong to TaskData
// unless we will generate guids somehow.
type TaskTypeDataWithKey = { key: string } & TaskTypeData;
type TaskNode = RenderNodeProps['node'];

type Action =
  | { type: 'update'; payload: Value }
  | { type: 'toggle'; payload: TaskNode }
  | { type: 'archive' };

const taskTypeTypeProp: TaskTypeTypeProp = 'task';

type CheckboxProps = Overwrite<
  React.InputHTMLAttributes<HTMLInputElement>,
  { style: StyleProp<ViewStyle> }
>;

// TODO: Use custom checkbox.
const Checkbox = (props: CheckboxProps) =>
  createElement('input', { ...props, type: 'checkbox' });

// data.toJS is costly and we don't need it anyway.
// This is simple type safe approach.
const getTaskData = (node: TaskNode): TaskTypeData => {
  const completed = 'completed';
  const depth = 'depth';
  return {
    [completed]: node.data.get(completed),
    [depth]: node.data.get(depth),
  };
};

const Uneditable: FunctionComponent = props => {
  return (
    <>
      <div contentEditable={false}>{props.children}</div>
      {/* 
        To prevent errror: "IndexSizeError: Failed to execute 'getRangeAt'
        on 'Selection': 0 is not a valid index."
      */}
      <style jsx>{`
        div {
          user-select: none;
        }
      `}</style>
    </>
  );
};

interface TaskProps extends RenderNodeProps {
  dispatch: Dispatch<Action>;
}

const TaskItem: FunctionComponent<TaskProps> = props => {
  const { theme } = useAppContext();
  const data = getTaskData(props.node);
  // https://reactjs.org/docs/hooks-faq.html#are-hooks-slow-because-of-creating-functions-in-render
  const getTaskDepthStyle = () => {
    // prettier-ignore
    switch (data.depth) {
      case 0: return theme.taskDepth0;
      case 1: return theme.taskDepth1;
      case 2: return theme.taskDepth2;
      case 3: return theme.taskDepth3;
      case 4: return theme.taskDepth4;
      case 5: return theme.taskDepth5;
      case 6: return theme.taskDepth6;
      case 7: return theme.taskDepth7;
      case 8: return theme.taskDepth8;
      case 9: return theme.taskDepth9;
      default: return data.depth < 0 ? theme.taskDepth0 : theme.taskDepth9;
    }
  };
  const depthStyle = getTaskDepthStyle();

  const handleCheckboxChange = useCallback(() => {
    props.dispatch({ type: 'toggle', payload: props.node });
  }, [props]);

  return (
    <View {...props.attributes} style={[theme.task, depthStyle]}>
      <View style={theme.taskCheckboxWrapper}>
        <Uneditable>
          <Checkbox
            style={[
              theme.taskCheckbox,
              data.completed && theme.taskCheckboxCompleted,
            ]}
            checked={data.completed}
            onChange={handleCheckboxChange}
          />
        </Uneditable>
      </View>
      <Text style={[theme.text, data.completed && theme.lineThrough]}>
        {props.children}
      </Text>
    </View>
  );
};

interface TaskListProps {
  taskList: TaskListType;
}

const TaskList: FunctionComponent<TaskListProps> = ({ taskList }) => {
  const nodeToTaskDataWithKey = (node: TaskNode): TaskTypeDataWithKey => ({
    key: node.key,
    ...getTaskData(node),
  });

  const editorRef = React.useRef<Editor>(null);

  const getEditor = () => {
    const { current } = editorRef;
    if (current == null) throw new Error('editorRef current is null');
    return current;
  };

  const getTaskIndex = (key: string): number => {
    const editor = getEditor();
    return editor.value.document.nodes.findIndex(
      node => node != null && node.key === key,
    );
  };

  const tasksWithChildren = (tasks: TaskTypeDataWithKey[]) => {
    // Dedupe via Map.
    const map: Map<string, TaskTypeDataWithKey> = new Map();
    tasks.forEach(task => map.set(task.key, task));

    const getTaskChildren = (
      task: TaskTypeDataWithKey,
    ): TaskTypeDataWithKey[] => {
      const editor = getEditor();
      const children: TaskTypeDataWithKey[] = [];
      const { nodes } = editor.value.document;
      let index = getTaskIndex(task.key);
      // eslint-disable-next-line no-constant-condition
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

    return [...map.values()];
  };

  const setNodesData = (tasks: TaskTypeDataWithKey[]) => {
    const editor = getEditor();
    tasks.forEach(task => {
      const { key, ...data } = task;
      editor.setNodeByKey(
        key,
        // @ts-ignore Probably wrong type definition.
        { data },
      );
    });
  };

  const toggleTasks = (tasks: TaskTypeDataWithKey[]) => {
    tasks = tasksWithChildren(tasks);
    const allCompleted = !tasks.some(task => !task.completed);
    const completedTasks = tasks.map(task => ({
      ...task,
      completed: !allCompleted,
    }));
    setNodesData(completedTasks);
  };

  // Reducer here is ok.
  // https://twitter.com/dan_abramov/status/1102010979611746304
  const editorValueReducer = (state: Value, action: Action) => {
    const assertNever = (action: never): never => {
      throw new Error(`Unexpected action: ${JSON.stringify(action)}`);
    };
    switch (action.type) {
      case 'update':
        return action.payload;
      case 'toggle': {
        toggleTasks([nodeToTaskDataWithKey(action.payload)]);
        return state;
      }
      case 'archive':
        return state;
      default:
        return assertNever(action);
    }
  };

  const initReducer = (taskListSlate: TaskListType['slate']) => {
    KeyUtils.resetGenerator(); // For SSR.
    return Value.fromJSON(taskListSlate);
  };

  const [editorValue, dispatch] = useReducer(
    editorValueReducer,
    taskList.slate,
    initReducer,
  );

  const renderNode = (
    props: RenderNodeProps,
    _editor: CoreEditor,
    next: () => any,
  ) => {
    switch (props.node.type) {
      case taskTypeTypeProp:
        return <TaskItem {...props} dispatch={dispatch} />;
      default:
        return next();
    }
  };

  const setAppState = useAppState();
  const taskListId = taskList.id;

  const saveThrottled = useMemo(() => {
    return throttle((value: Value) => {
      setAppState(state => {
        const index = state.taskLists.findIndex(t => t.id === taskListId);
        if (index === -1) return;
        state.taskLists[index].slate = value.toJSON() as TaskListType['slate'];
      });
    }, 1000);
  }, [setAppState, taskListId]);

  const handleEditorChange = ({ value }: { value: Value }) => {
    // TODO: Validate value. Slate can fail. In such case, log it and revert.
    dispatch({ type: 'update', payload: value });
    const documentHasBeenChanged = value.document !== editorValue.document;
    if (!documentHasBeenChanged) return;
    saveThrottled(value);
  };

  const screenSize = useScreenSize();

  return (
    <Editor
      autoFocus={!screenSize.phoneOnly}
      autoCorrect={false}
      spellCheck={false}
      onChange={handleEditorChange}
      // onKeyDown={handleKeyDown}
      ref={editorRef}
      renderNode={renderNode}
      value={editorValue}
    />
  );
};

export default TaskList;
