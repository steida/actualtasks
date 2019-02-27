import React, { FunctionComponent } from 'react';
import useAppContext from '../hooks/useAppContext';
import Link from './Link';
import useAppState from '../hooks/useAppState';

const TaskLists: FunctionComponent = () => {
  const [taskLists] = useAppState(state => state.taskLists);
  const { theme } = useAppContext();
  // ✎ for edit? menu for active tasklist?
  // const isActive = true;
  return (
    <>
      {taskLists
        .slice(0) // Because taskLists is immutable and sort mutates.
        .sort()
        .map(taskList => {
          return (
            <Link
              style={[theme.button, theme.buttonSmall]}
              href="/me"
              key={taskList.id}
            >
              {taskList.name}
            </Link>
          );
        })}
    </>
  );
};

export default TaskLists;
