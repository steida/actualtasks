import { TaskList as TaskListType } from '@app/state/types';
import React, { FunctionComponent, useState } from 'react';
import { Editor, RenderNodeProps } from 'slate-react';
import { Editor as CoreEditor, KeyUtils, Value } from 'slate';
// @ts-ignore
import { createElement } from 'react-native-web';
import { Text, View, ViewStyle, StyleProp } from 'react-native';
import { Overwrite } from 'utility-types';
import useAppContext from '../hooks/useAppContext';

type TaskType = TaskListType['slate']['document']['nodes'][0];
type TaskTypeData = TaskType['data'];
type TaskTypeTypeProp = TaskType['type'];

const taskTypeTypeProp: TaskTypeTypeProp = 'task';

type CheckboxProps = Overwrite<
  React.InputHTMLAttributes<HTMLInputElement>,
  { style: StyleProp<ViewStyle> }
>;

// TODO: Use custom checkbox.
const Checkbox = (props: CheckboxProps) =>
  createElement('input', { ...props, type: 'checkbox' });

const getTaskData = (node: RenderNodeProps['node']): TaskTypeData => {
  // data.toJS is costly and we don't need it anyway.
  // This is simple type safe approach.
  const completed = 'completed';
  const depth = 'depth';
  return {
    [completed]: node.data.get(completed),
    [depth]: node.data.get(depth),
  };
};

interface TaskProps extends RenderNodeProps {
  foo?: any; // TODO: Dispatcher.
}

const Task: FunctionComponent<TaskProps> = props => {
  const { theme } = useAppContext();
  const data = getTaskData(props.node);
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
        return data.depth < 0 ? theme.taskDepth0 : theme.taskDepth9;
    }
  };
  const depthStyle = getTaskDepthStyle();
  // console.log(React.Children.toArray(props.children)[0].props.block.count());

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
            onChange={() => {}}
            // onChange={() => props.onCheckboxChange(props.node)}
          />
        </div>
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
  const [editorValue] = useState(() => {
    // For SSR.
    KeyUtils.resetGenerator();
    return Value.fromJSON(taskList.slate);
  });

  const renderNode = (
    props: RenderNodeProps,
    _editor: CoreEditor,
    next: () => any,
  ) => {
    switch (props.node.type) {
      case taskTypeTypeProp:
        return (
          <Task
            {...props}
            // onCheckboxChange={handleTaskCheckboxChange}
          />
        );
      default:
        return next();
    }
  };

  return (
    <Editor
      // autoFocus does not work reliable.
      autoCorrect={false}
      // onChange={handleEditorChange}
      // onKeyDown={handleKeyDown}
      // ref={editorRef}
      renderNode={renderNode}
      // spellCheck={false}
      // @ts-ignore
      value={editorValue}
    />
  );
};

export default TaskList;
