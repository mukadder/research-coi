import React from 'react/addons'; //eslint-disable-line no-unused-vars
import {ResponsiveComponent} from './ResponsiveComponent';
import {merge} from '../merge';
import ReactRouter from 'react-router';
let Link = ReactRouter.Link;
import {KualiLogo} from './DynamicIcons/KualiLogo';
import {ProfileIcon} from './DynamicIcons/ProfileIcon';
import {HeaderButton} from './HeaderButton';
import {HamburgerIcon} from './DynamicIcons/HamburgerIcon';

export class AppHeader extends ResponsiveComponent {
  constructor() {
    super();
    this.commonStyles = {
      logo: {
        width: 26,
        height: 26,
        verticalAlign: 'middle',
        color: 'black'
      },
      kuali: {
        display: 'inline-block',
        verticalAlign: 'top',
        marginTop: '-3px'
      },
      product: {
        color: 'black',
        fontSize: 20,
        fontWeight: '300',
        verticalAlign: 'middle',
        paddingLeft: 5,
        paddingRight: 18,
        borderRight: '1px solid',
        marginRight: 15
      },
      modulename: {
        color: 'black',
        fontSize: 16,
        fontWeight: '300',
        paddingLeft: 5,
        paddingTop: 7
      },
      searchIcon: {
        width: '28px',
        verticalAlign: 'middle',
        padding: '0 10px',
        cursor: 'pointer'
      },
      controls: {
        'float': 'right',
        cursor: 'pointer',
        display: 'inline-block',
        height: 42
      },
      icon: {
        color: '#676767',
        width: '65px',
        verticalAlign: 'middle',
        padding: '0 10px'
      },
      mobileMenu: {
        color: 'white',
        height: '100%'
      }
    };
  }

  renderMobile() {
    let mobileStyles = {
      container: {
        backgroundColor: '#202020',
        padding: '0 10px 0 6px'
      }
    };
    let styles = merge(this.commonStyles, mobileStyles);

    return (
      <header style={merge(styles.container, this.props.style)}>
        <span style={{margin: '6px 0', display: 'inline-block'}}>
          <KualiLogo style={styles.logo} />
          <span style={styles.kuali}>
            <div style={styles.product}>Kuali<span style={{fontWeight: 'bold'}}>Research</span></div>
            <div style={styles.modulename}>CONFLICT OF INTEREST</div>
          </span>
        </span>
        <span style={styles.controls}>
          <HamburgerIcon style={styles.mobileMenu} />
        </span>
      </header>
    );
  }

  renderDesktop() {
    let desktopStyles = {
      container: {
        backgroundColor: 'white',
        padding: '0 10px 0 50px'
      }
    };
    let styles = merge(this.commonStyles, desktopStyles);

    return (
      <header style={merge(styles.container, this.props.style)}>
        <span style={{margin: '6px 0', display: 'inline-block'}}>
          <Link to={this.props.homelink}>
            <KualiLogo style={styles.logo} />
            <span style={styles.product}>
              Kuali
              <span style={{fontWeight: 'bold'}}>Research</span>
            </span>
          </Link>
          <span style={styles.kuali}>
            <div style={styles.modulename}>Conflict Of Interest</div>
          </span>
        </span>
        <span style={styles.controls}>
          <span>
            <HeaderButton icon={ProfileIcon} label="ACCOUNT" />
          </span>
        </span>
      </header>
    );
  }
}
