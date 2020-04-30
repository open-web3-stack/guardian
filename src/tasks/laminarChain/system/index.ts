import { laminarApi$ } from '../laminarApi';
import EventsTask from '../../shared/EventsTask';

export default {
  events: new EventsTask(laminarApi$),
};
