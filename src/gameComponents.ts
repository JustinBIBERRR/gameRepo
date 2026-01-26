/**
 * TinyVue 组件全局注册
 * 
 * 使用 @opentiny/vue 组件库，采用按需导入方式支持 tree-shaking
 * 所有组件使用 `game-` 前缀进行全局注册，无需在各 Vue 文件中单独 import
 * 
 * 组件命名规范：
 * - TinyVue: TinyButton -> game-button
 * - 使用方式: <game-button>按钮</game-button>
 * 
 * 参考文档: https://opentiny.design/tiny-vue
 */

import type { App, Component } from 'vue'

// 按需导入 TinyVue 组件
import {
  Button,
  Input,
  Switch,
  Select,
  Option,
  Form,
  FormItem,
  Table,
  Modal,
  Drawer,
  Collapse,
  CollapseItem,
  Card,
  Tabs,
  TabItem,
  Tooltip,
  Popover,
  Alert,
  Notify,
  Loading,
  Pager,
  Search,
  DialogBox,
  Numeric,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  Tag,
  Badge,
  Grid,
  GridColumn,
  Layout,
  Row,
  Col
} from '@opentiny/vue'

// 按需导入图标
import {
  IconEyeopen,
  IconEyeclose,
  IconPlus,
  IconDel,
  IconEdit,
  IconSearch,
  IconRefresh,
  IconSetting,
  IconClose,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconChevronDown,
  IconYes,
  IconWarning,
  IconError,
  IconHelp,
  IconInfoCircle
} from '@opentiny/vue-icon'

// 组件前缀
const PREFIX = 'game'

// 组件列表
const tinyComponents: Component[] = [
  Button,
  Input,
  Switch,
  Select,
  Option,
  Form,
  FormItem,
  Table,
  Modal,
  Drawer,
  Collapse,
  CollapseItem,
  Card,
  Tabs,
  TabItem,
  Tooltip,
  Popover,
  Alert,
  Notify,
  Loading,
  Pager,
  Search,
  DialogBox,
  Numeric,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  Tag,
  Badge,
  Grid,
  GridColumn,
  Layout,
  Row,
  Col
]

// 图标列表（需要调用函数获取组件）
const tinyIcons = [
  IconEyeopen,
  IconEyeclose,
  IconPlus,
  IconDel,
  IconEdit,
  IconSearch,
  IconRefresh,
  IconSetting,
  IconClose,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconChevronDown,
  IconYes,
  IconWarning,
  IconError,
  IconHelp,
  IconInfoCircle
]

/**
 * 安装函数 - 全局注册所有 game-xxx 组件
 */
export function install(app: App): void {
  // 注册组件: TinyButton -> game-button
  tinyComponents.forEach((component) => {
    if (component.name) {
      const name = component.name.replace('Tiny', PREFIX + '-').toLowerCase()
      app.component(name, component)
    }
  })
  
  // 注册图标: IconEyeopen -> game-icon-eyeopen
  tinyIcons.forEach((iconFn) => {
    const icon = iconFn()
    if (icon.name) {
      const name = icon.name.replace('Icon', PREFIX + '-icon-').toLowerCase()
      app.component(name, icon)
    }
  })
}

// 导出命令式调用
export { Notify as GameNotify, Modal as GameModal, Loading as GameLoading }

export default { install }
