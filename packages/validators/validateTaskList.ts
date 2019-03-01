import { TaskList } from '@app/state/types';
import { validateMax32Chars } from '.';
import { Max32CharsError } from './types';

interface TaskListErrors {
  name: Max32CharsError | null;
}

const validateTaskList = (input: TaskList): TaskListErrors => ({
  name: validateMax32Chars(input.name),
});

export default validateTaskList;
