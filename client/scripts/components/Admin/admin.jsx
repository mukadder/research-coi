import React from 'react/addons';
import Router from 'react-router';
let Route = Router.Route;
let DefaultRoute = Router.DefaultRoute;
let RouteHandler = Router.RouteHandler;
import {merge} from '../../merge';
import request from 'superagent';

import {AppHeader} from '../AppHeader';
import {DetailView} from './DetailView/DetailView';
import {ListView} from './ListView/ListView';
import {SizeAwareComponent} from '../SizeAwareComponent';

class App extends SizeAwareComponent {
  render() {
    let styles = {
      container: {
        height: '100%',
        overflowX: 'hidden'
      },
      header: {
        boxShadow: '0 1px 6px #D1D1D1',
        zIndex: 9
      }
    };

    return (
      <div className="flexbox column" style={merge(styles.container, this.props.style)}>
        <AppHeader homelink="listview" style={styles.header} />
        <RouteHandler />
      </div>
    );
  }
}

let routes = (
  <Route name="app" path="/" handler={App}>
    <Route name="detailview" path="/detailview" handler={DetailView}>
      <Route name="detailidview" path="/detailview/:id" handler={DetailView}/>
    </Route>
    <Route name="listview" path="/listview" handler={ListView} />
    <DefaultRoute handler={ListView} />
  </Route>
);

// Then load config and re-render
request.get('/api/coi/config', (err, config) => {
  if (!err) {
    window.config = config.body;
    Router.run(routes, (Handler, state) => {
      React.render(<Handler state={state} />, document.body);
    });
  }
});
