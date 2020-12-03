import { Component, h, Listen, Method, State } from '@stencil/core';

type App = { name: string, url: string, lastUrl?: string };

@Component({
  tag: 'my-component',
  styleUrl: 'my-component.css',
  shadow: true,
})
export class MyComponent {

  readonly SESSION_STORAGE_KEY: string = 'NAV_HEADER_STATE';

  @State() apps: App[] = [
    { name: 'DFS', url: '/feature/nav-poc-dfs' },
    { name: 'Visit', url: '/feature/nav-poc-visit' },
  ];
  @State() alerts: number = 0;
  @State() dropdownVisible: boolean = false;

  constructor() {
    // patch pushState so we can send an event on pushState
    (function(history){
      if (!window['__pushStatePatched__'])
      var pushState = history.pushState;
      history.pushState = function(_data, _title, url) {
        window.dispatchEvent(new CustomEvent('pushstate', { detail: { url } }));
        return pushState.apply(history, arguments);
      };
      window['__pushStatePatched__'] = true;
    })(window.history);
  }

  componentWillLoad(): void {
    this.apps = JSON.parse(sessionStorage.getItem(this.SESSION_STORAGE_KEY) || null) || this.apps;
    // Update session storage state
    window.dispatchEvent(new CustomEvent('pushstate', { detail: { url: location.pathname } }));
  }

  @Listen('pushstate', { target: 'window' })
  onRouteChange({ detail }: CustomEvent<{url: string}>) {
    this.apps = this.apps.map(app => {
      if(detail.url.length === 1 ? detail.url === app.url : detail.url.startsWith(app.url)) {
        return { ...app, lastUrl: detail.url};
      }
      return app;
    });
    sessionStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify(this.apps));
  }

  @Method()
  async addAlert(text: string): Promise<void> {
    this.alerts++;
    alert(text);
  }

  isActive(app: App): boolean {
    return location.pathname.length === 1 ? app.url === '/' : location.pathname.startsWith(app.url);
  }

  toggleDropdown(): boolean {
    this.dropdownVisible = !this.dropdownVisible;
    return true;
  }

  render() {
    return (
      <div class="nav-header__container">
        <div class="nav-heaver__container--left">
          {this.apps.map(app => <div class={{ 'nav-header__item': true, 'nav-header__item--active': this.isActive(app) }}><a href={app.lastUrl || app.url}>{app.name}</a></div>)}
        </div>
        <div class="nav-heaver__container--right">
          <div class="nav-header__alerts">{this.alerts} Alerts</div>
          <div class="nav-header__user" onClick={() => this.toggleDropdown()}>
            <div>Username</div>
            {this.dropdownVisible &&
              <div class="nav-header__dropdown">
                <div class="nav-header__dropdown--item">Some</div>
                <div class="nav-header__dropdown--item">Dropdown</div>
                <div class="nav-header__dropdown--item">Items</div>
                <div class="nav-header__dropdown--item">As</div>
                <div class="nav-header__dropdown--item">Example</div>
              </div>
            }
          </div>
        </div>
      </div>);
  }

}
