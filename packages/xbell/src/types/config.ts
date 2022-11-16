import type { UserConfigExport } from 'vite';
import type { XBellTestCaseFunction } from './test';
import type { StorageState } from './pw';
export type XBellBrowserType = 'chromium' | 'firefox' | 'webkit';

export interface XBellBrowserConfig {
  headless?: boolean;
  /** browser viewport */
  viewport?: {
    width: number;
    height: number;
  };
  // cookies & origins(localStorage)
  storageState?: StorageState | 'string';
  /** browser dev server */
  devServer?: {
    viteConfig?: UserConfigExport;
  }
}

export interface XBellConfig {
  /** setup */
  setup?: string[] | string | (() => Promise<void> | void);
  /** teardown */
  teardown?: string[] | string | (() => Promise<void> | void);
  /** browser config */
  browser?: XBellBrowserConfig;
  /** projects */
  projects?: XBellProject[];
  /** include */
  include?: string[];
  /** exclude */
  exclude?: string[];

  hooks?: {
    beforeEach?: XBellTestCaseFunction;
    afterEach?: XBellTestCaseFunction;
  }

  coverage?: {
    enabled?: boolean;
    include?: string[];
    exclude?: string[];
  }
}

type XBellConfigOptionalsKeys = 'setup' | 'teardown' | 'browser';
type XBellBrowserConfigOptionalsKeys = 'storageState';

export type XBellBrowserConfigRequired =
  Required<Omit<XBellBrowserConfig, XBellBrowserConfigOptionalsKeys>> &
  Partial<Pick<XBellBrowserConfig, XBellBrowserConfigOptionalsKeys>>;;
  
export type XBellConfigRequired =
  Required<Omit<XBellConfig, XBellConfigOptionalsKeys>> &
  Partial<Pick<XBellConfig, XBellConfigOptionalsKeys>> & {
    browser: XBellBrowserConfigRequired;
  };

export type XBellTaskConfig = Partial<
  Pick<
    XBellConfig, 'browser'
  >
>;

export type XBellProject = {
  name: XBellProjects['name'];
  config?: XBellConfig;
} & Omit<XBellProjects, 'name'>;

export interface XBellBrowserCallback {
  callback: (...args: any) => any;
  filename: string;
  sortValue: number;
}

export type XBellRuntimeOptions = Partial<{
  browserCallbacks: XBellBrowserCallback[];
  args?: object
}>;
