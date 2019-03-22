import { TaskList as TaskListType, AppState } from '@app/state/types';
import React, {
  FunctionComponent,
  useMemo,
  Dispatch,
  useCallback,
  useState,
  memo,
} from 'react';
import { Editor, RenderNodeProps, getEventTransfer } from 'slate-react';
import { Editor as CoreEditor, KeyUtils, Value, Block } from 'slate';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import throttle from 'lodash.throttle';
import { isHotkey } from 'is-hotkey';
import useAppContext from '@app/hooks/useAppContext';
import useAppState from '@app/hooks/useAppState';
import useScreenSize from '@app/hooks/useScreenSize';
import createTaskList from '@app/state/createTaskList';
import TaskListBar from './TaskListBar';
import { LayoutScrollView } from './Layout';

// The problems with schema are:
// 1) It's not called at all for some reason.
// 2) People report invalid state is still in history.
// const schema: SchemaProperties = {
//   document: {
//     nodes: [{ match: { type: 'task' } }],
//     normalize: (editor, error) => {
//       console.log('foo');
//       switch (error.code) {
//         case 'child_type_invalid':
//           editor.setNodeByKey(error.child.key, { type: 'task' });
//           break;
//         case 'child_required': {
//           console.log('foo');
//           const task = Block.create('task');
//           editor.insertNodeByKey(task.key, 0, task);
//           break;
//         }
//       }
//       // Do we need it?
//       // node_data_invalid
//       // editor.setNodeByKey(node.key, { data: { thing: 'value' } })
//     },
//   },
//   // blocks: {
//   //   paragraph: { nodes: [{ match: { object: 'text' } }] },
//   // },
// };

type TaskType = TaskListType['slate']['document']['nodes'][0];
type TaskTypeTypeProp = TaskType['type'];
type TaskTypeData = TaskType['data'];
// Slate key is an implementation detail. It does not belong to TaskData
// unless we will generate guids somehow.
type TaskTypeDataWithKey = { key: string } & TaskTypeData;
type TaskNode = RenderNodeProps['node'];

export type Action =
  | { type: 'toggleCompleted'; tasks: TaskTypeDataWithKey[] }
  | {
      type: 'moveHorizontal';
      tasks: TaskTypeDataWithKey[];
      forward: boolean;
    }
  | { type: 'moveVertical'; task: TaskTypeDataWithKey; forward: boolean }
  | { type: 'insertText'; text: string }
  | { type: 'archive' };

const taskTypeTypeProp: TaskTypeTypeProp = 'task';

// data.toJS is costly and we don't need it anyway.
// This is simple type safe approach.
const getTaskData = (node: TaskNode): TaskTypeData => {
  const completed = 'completed';
  const completedAt = 'completedAt';
  const depth = 'depth';
  return {
    [completed]: node.data.get(completed),
    [completedAt]: node.data.get(completedAt),
    [depth]: node.data.get(depth),
  };
};

const nodeToTaskDataWithKey = (node: TaskNode): TaskTypeDataWithKey => ({
  key: node.key,
  ...getTaskData(node),
});

const Uneditable: FunctionComponent = props => {
  return (
    <>
      <div contentEditable={false}>{props.children}</div>
      {/* 
        To fix errror: "IndexSizeError: Failed to execute 'getRangeAt'
        on 'Selection': 0 is not a valid index." and some others.
      */}
      <style jsx>{`
        div {
          user-select: none;
        }
      `}</style>
    </>
  );
};

interface CheckBoxProps {
  checked: boolean;
  focused: boolean;
  hidden: boolean;
  onChange: () => void;
}

// We don't need browser native checkbox.
const Checkbox: FunctionComponent<CheckBoxProps> = props => {
  const { theme } = useAppContext();

  const svgStyle = useMemo(() => {
    const {
      display: fill,
      color: stroke,
      width: strokeWidth,
    } = StyleSheet.flatten(theme.taskCheckboxSvg);
    return { fill, stroke, strokeWidth };
  }, [theme.taskCheckboxSvg]);

  return (
    <TouchableOpacity accessibilityRole="button" onPress={props.onChange}>
      <View style={[theme.taskCheckbox, props.hidden && theme.opacity0]}>
        {props.checked && (
          <svg style={svgStyle} viewBox="0 0 24 24">
            <polyline points="19 5 10 18 5 12" />
          </svg>
        )}
      </View>
    </TouchableOpacity>
  );
};

interface TaskProps extends RenderNodeProps {
  dispatch: Dispatch<Action>;
}

const Task: FunctionComponent<TaskProps> = props => {
  const { theme } = useAppContext();
  const handleCheckboxChange = useCallback(() => {
    props.dispatch({
      type: 'toggleCompleted',
      tasks: [nodeToTaskDataWithKey(props.node)],
    });
  }, [props]);

  const data = getTaskData(props.node);

  // pokud neni, tak prazdne view? pak ale budu imho mazat

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

  const hideCheckbox =
    !props.isFocused && !data.completed && props.node.text.length === 0;

  return (
    <View {...props.attributes} style={[theme.task, depthStyle]}>
      <Uneditable>
        <Checkbox
          checked={data.completed}
          focused={props.isFocused}
          hidden={hideCheckbox}
          onChange={handleCheckboxChange}
        />
      </Uneditable>
      <Text style={[theme.text, data.completed && theme.lineThrough]}>
        {props.children}
      </Text>
    </View>
  );
};

interface TaskListProps {
  slateInitialValue: TaskListType['slate'];
  taskListId: string;
}

// TaskList holds Slate editor state, because of immutable.js, we can not
// serialize and deserialize the whole editor state on every key stroke.
// Therefore, editor state is browser tab specific aka not live updated.
// TODO: Once Slate will switch to plain objects, move state to local storage.
// Note TaskList must be memoized because Editor state is brittle.
// I had a problem when rerender via archive did not remove nodes.
const TaskList: FunctionComponent<TaskListProps> = memo(
  ({ slateInitialValue, taskListId }) => {
    const editorRef = React.useRef<Editor>(null);

    const getEditor = () => {
      const { current } = editorRef;
      if (current == null) throw new Error('editorRef current is null');
      return current;
    };

    const getSelectedTasks = (): TaskTypeDataWithKey[] => {
      const selectedTasks: TaskTypeDataWithKey[] = [];
      const editor = getEditor();
      editor.value.blocks.forEach(node => {
        if (node == null || node.type !== taskTypeTypeProp) return;
        selectedTasks.push(nodeToTaskDataWithKey(node));
      });
      return selectedTasks;
    };

    const getTaskIndex = useCallback((key: string): number => {
      const editor = getEditor();
      return editor.value.document.nodes.findIndex(
        node => node != null && node.key === key,
      );
    }, []);

    const tasksWithChildren = useCallback(
      (tasks: TaskTypeDataWithKey[]) => {
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
      },
      [getTaskIndex],
    );

    const setNodesData = useCallback((tasks: TaskTypeDataWithKey[]) => {
      const editor = getEditor();
      tasks.forEach(task => {
        const { key, ...data } = task;
        editor.setNodeByKey(
          key,
          // @ts-ignore Probably wrong type definition.
          { data },
        );
      });
    }, []);

    const toggleCompleted = useCallback(
      (tasks: TaskTypeDataWithKey[]) => {
        tasks = tasksWithChildren(tasks);
        const atLeastOneCompleted = tasks.some(task => !task.completed);
        const completedAt = atLeastOneCompleted ? Date.now() : undefined;
        const completedTasks = tasks.map(task => ({
          ...task,
          completed: atLeastOneCompleted,
          completedAt,
        }));
        setNodesData(completedTasks);
      },
      [setNodesData, tasksWithChildren],
    );

    const canShiftTab = (tasks: TaskTypeDataWithKey[]) =>
      !tasks.some(task => task.depth === 0);

    const moveHorizontal = useCallback(
      (tasks: TaskTypeDataWithKey[], forward: boolean) => {
        const editor = getEditor();
        const firstTask = tasks[0];
        tasks = tasksWithChildren(tasks);
        const canTab = () => {
          const taskIndex = getTaskIndex(firstTask.key);
          if (taskIndex === 0) return false;
          const previous = editor.value.document.nodes.get(taskIndex - 1);
          if (previous == null) return false;
          const previousDepth = getTaskData(previous).depth;
          const firstDepth = tasks[0].depth;
          return firstDepth <= previousDepth;
        };
        const canChangeDepth = forward ? canTab() : canShiftTab(tasks);
        if (!canChangeDepth) return;
        const changedTasks = tasks.map(task => ({
          ...task,
          depth: task.depth + (forward ? 1 : -1),
        }));
        setNodesData(changedTasks);
      },
      [getTaskIndex, setNodesData, tasksWithChildren],
    );

    const moveVertical = useCallback(
      (task: TaskTypeDataWithKey, forward: boolean) => {
        const editor = getEditor();
        const { nodes } = editor.value.document;
        let index = getTaskIndex(task.key);
        if (index === 0 && !forward) return;
        let siblingData = null;
        while (forward ? index < nodes.count() : index > 0) {
          index += forward ? 1 : -1;
          const sibling = nodes.get(index);
          if (sibling == null) return;
          siblingData = getTaskData(sibling);
          if (siblingData.depth <= task.depth) break;
        }
        let tasks = tasksWithChildren([task]);
        const depthChanged = siblingData && siblingData.depth < task.depth;
        tasks = tasks.map(task => {
          return {
            ...task,
            depth: Math.max(task.depth - (depthChanged ? 1 : 0), 0),
          };
        });
        if (forward) {
          const task = nodeToTaskDataWithKey(nodes.get(index));
          index += tasksWithChildren([task]).length - 1;
          tasks.reverse().forEach((task, i) => {
            setNodesData([task]);
            editor.moveNodeByKey(
              task.key,
              editor.value.document.key,
              index - i,
            );
          });
        } else {
          tasks.forEach((task, i) => {
            setNodesData([task]);
            editor.moveNodeByKey(
              task.key,
              editor.value.document.key,
              index + i,
            );
          });
        }
      },
      [getTaskIndex, setNodesData, tasksWithChildren],
    );

    const setAppState = useAppState();

    const archive = useCallback(() => {
      const editor = getEditor();
      if (!editor.value.selection.isCollapsed) return;
      const completed: Block[] = [];
      editor.value.document.nodes.forEach(node => {
        if (node == null) return;
        if (!getTaskData(node).completed) return;
        completed.push(node);
      });

      // For some reason, schema does not work as expected, so we have to
      // ensure non empty list manually. For some another reason, a task
      // must be added before removing.
      const allRemoved =
        completed.length === editor.value.document.nodes.count();
      if (allRemoved) {
        const list = createTaskList('');
        const task = Block.fromJSON(list.slate.document.nodes[0]);
        editor.insertBlock(task);
      }

      completed.forEach(node => {
        editor.removeNodeByKey(node.key);
      });

      setAppState(({ taskLists }) => {
        const currentTaskList = taskLists.find(t => t.id === taskListId);
        if (currentTaskList == null) return;
        const archivedSlate = currentTaskList.archivedSlate || {
          document: { nodes: [] },
        };
        currentTaskList.archivedSlate = archivedSlate;
        completed.forEach(node => {
          archivedSlate.document.nodes.push(node.toJSON() as TaskType);
        });
        // const completedArray = Object.values(completed).map(
        //   item => item.toJSON() as TaskType,
        // );
        // archivedSlate.document.nodes.push(...completedArray);
      });
    }, [setAppState, taskListId]);

    const [editorValue, setEditorValue] = useState(() => {
      KeyUtils.resetGenerator(); // For SSR.
      return Value.fromJSON(slateInitialValue);
    });

    const dispatch = useCallback(
      (action: Action) => {
        const assertNever = (action: never): never => {
          throw new Error(`Unexpected action: ${JSON.stringify(action)}`);
        };
        switch (action.type) {
          case 'toggleCompleted': {
            toggleCompleted(action.tasks);
            break;
          }
          case 'moveHorizontal': {
            moveHorizontal(action.tasks, action.forward);
            break;
          }
          case 'moveVertical': {
            moveVertical(action.task, action.forward);
            break;
          }
          case 'insertText': {
            getEditor().insertText(action.text);
            break;
          }
          case 'archive': {
            archive();
            break;
          }
          default:
            return assertNever(action);
        }
      },
      [archive, moveHorizontal, moveVertical, toggleCompleted],
    );

    const renderNode = useCallback(
      (props: RenderNodeProps, _editor: CoreEditor, next: () => any) => {
        switch (props.node.type) {
          case taskTypeTypeProp:
            return <Task {...props} dispatch={dispatch} />;
          default:
            return next();
        }
      },
      [dispatch],
    );

    // Because toJSON is costly.
    // TODO: Once Slate will switch to plain objects, move state to local storage.
    const saveThrottled = useMemo(() => {
      return throttle((value: Value) => {
        setAppState(({ taskLists }) => {
          const index = taskLists.findIndex(t => t.id === taskListId);
          if (index === -1) return;
          taskLists[index].slate = value.toJSON() as TaskListType['slate'];
        });
      }, 1000);
    }, [setAppState, taskListId]);

    const handleEditorChange = useCallback(
      ({ value }: { value: Value }) => {
        setEditorValue(value);
        const documentHasBeenChanged = value.document !== editorValue.document;
        if (!documentHasBeenChanged) return;
        saveThrottled(value);
      },
      [editorValue.document, saveThrottled],
    );

    const handleEditorKeyDown = (
      event: KeyboardEvent,
      _editor: CoreEditor,
      next: () => any,
    ) => {
      const isAltEnter = isHotkey('alt+enter')(event);
      if (isAltEnter) {
        event.preventDefault();
        dispatch({ type: 'toggleCompleted', tasks: getSelectedTasks() });
        return;
      }

      const isAltShiftEnter = isHotkey('alt+shift+enter')(event);
      if (isAltShiftEnter) {
        event.preventDefault();
        dispatch({ type: 'archive' });
        return;
      }

      const isTab = isHotkey('tab')(event);
      const isShiftTab = isHotkey('shift+tab')(event);
      if (isTab || isShiftTab) {
        const tasks = getSelectedTasks();
        event.preventDefault();
        dispatch({
          type: 'moveHorizontal',
          tasks,
          forward: isTab,
        });
        return;
      }

      // mod is cmd on Mac and ctrl on Windows
      const isModUp = isHotkey('mod+up')(event);
      const isModDown = isHotkey('mod+down')(event);
      if (isModUp || isModDown) {
        const tasks = getSelectedTasks();
        // We know how to vertically move only just one task.
        if (tasks.length === 1) {
          event.preventDefault();
          dispatch({
            type: 'moveVertical',
            task: tasks[0],
            forward: isModDown,
          });
          return;
        }
      }

      const isEnter = isHotkey('enter')(event);
      if (isEnter) {
        const editor = getEditor();
        const taskHasText = editor.value.blocks.get(0).text.length > 0;
        const tasks = getSelectedTasks();
        if (!taskHasText && canShiftTab(tasks)) {
          event.preventDefault();
          dispatch({
            type: 'moveHorizontal',
            tasks,
            forward: false,
          });
          return;
        }
      }

      const isEscape = isHotkey('escape')(event);
      if (isEscape) {
        const link = document.getElementById(`menuTaskListLink${taskListId}`);
        if (link) {
          link.focus();
          return;
        }
      }

      return next();
    };

    const handleEditorPaste = (event: ClipboardEvent) => {
      // Prevent default so the DOM state isn't corrupted.
      event.preventDefault();
      // Wrong type definition.
      const transfer: any = getEventTransfer(event);
      const text =
        transfer.type === 'text' || transfer.type === 'html'
          ? transfer.text
          : transfer.type === 'fragment'
          ? transfer.fragment.getText()
          : '';
      if (!text) return;
      dispatch({ type: 'insertText', text });
    };

    const screenSize = useScreenSize();

    const hasCompletedTask = useMemo(() => {
      return editorValue.document.nodes.some(node => {
        return node ? nodeToTaskDataWithKey(node).completed : false;
      });
    }, [editorValue.document.nodes]);

    return (
      <>
        <TaskListBar hasCompletedTask={hasCompletedTask} dispatch={dispatch} />
        <LayoutScrollView>
          <Editor
            autoFocus={!screenSize.phoneOnly}
            autoCorrect={false}
            spellCheck={false}
            renderNode={renderNode}
            onChange={handleEditorChange}
            // @ts-ignore
            onKeyDown={handleEditorKeyDown}
            // @ts-ignore
            onPaste={handleEditorPaste}
            ref={editorRef}
            value={editorValue}
          />
        </LayoutScrollView>
      </>
    );
  },
);

export default TaskList;

interface TaskListWithDataProps {
  taskListId: string;
}

export const TaskListWithData: FunctionComponent<TaskListWithDataProps> = ({
  taskListId,
}) => {
  // Remember useAppState hook is a subscription.
  // Therefore, make selector as specific as possible.
  // Here we ignore all taskList changes except the slate prop.
  const slate = useAppState(
    useCallback(
      ({ taskLists }: AppState) => {
        const taskList = taskLists.find(t => t.id === taskListId);
        return taskList != null ? taskList.slate : null;
      },
      [taskListId],
    ),
  );

  // Use useState to set slate initial value.
  // The state is reseted by parent component via key prop.
  const [slateInitialValue] = useState(slate);

  if (slateInitialValue == null || taskListId == null) return null;
  return (
    <TaskList slateInitialValue={slateInitialValue} taskListId={taskListId} />
  );
};
