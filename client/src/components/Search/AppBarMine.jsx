import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Fab from '@material-ui/core/Fab';

import AddIcon from '@material-ui/icons/Add';
import SearchIcon from '@material-ui/icons/Search';
import { Input } from '@material-ui/core';

import MoreIcon from '@material-ui/icons/MoreVert';
import LoadList from './LoadList';
import PopComponent from './Popup/Pop.component';
import ChatButton from './ChatButton';

const style = theme => ({
  text: {
    paddingTop: theme.spacing.unit * 2,
    paddingLeft: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
  },
  paper: {
    paddingBottom: 50,
  },
  list: {
    marginBottom: theme.spacing.unit * 2,
  },
  subHeader: {
    backgroundColor: theme.palette.background.paper,
  },
  appBar: {
    top: 'auto',
    bottom: 0,
  },
  toolbar: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fabButton: {
    position: 'absolute',
    zIndex: 1,
    top: -30,
    left: 0,
    right: 0,
    margin: '0 auto',
  },
});

class AppBarMine extends Component {
  constructor(props) {
    super(props);
    this.state = {
      extended: false,
      valueSearch: '',
    };
  }

  render() {
    const { classes } = this.props;
    return (
      <div
        style={{ paddinBottom: '30%' }}
        ref={ref => (this.anchorElement = ref)}
      >
        <div>
          <AppBar position="fixed" color="primary" className={classes.appBar}>
            {this.state.valueSearch.length > 0 ? (
              <LoadList
                searchValue={this.state.valueSearch}
                className={this.state.extended ? 'search' : 'byeWidth'}
              />
            ) : null}
            <Toolbar className={classes.toolbar}>
              <PopComponent />

              {/* <Fab
                color="secondary"
                aria-label="Add"
                className={classes.fabButton}
              >
                <AddIcon />
              </Fab> */}
              <div>
                <Input
                  className={this.state.extended ? 'ExtendedInput' : 'NoInput'}
                  onChange={e => this.setState({ valueSearch: e.target.value })}
                />
                <IconButton
                  color="inherit"
                  onClick={() =>
                    this.setState({ extended: !this.state.extended })
                  }
                >
                  <SearchIcon />
                </IconButton>
                <ChatButton />

                <IconButton color="inherit">
                  <MoreIcon />
                </IconButton>
              </div>
            </Toolbar>
          </AppBar>
        </div>
      </div>
    );
  }
}

export default withStyles(style)(AppBarMine);
