import React from 'react';
import { connect } from 'react-redux';
import { Menu } from 'antd';
const { SubMenu, Item } = Menu;

function nameGen(name, occupied) {
  let n = 1;
  let newName = name;
  while (occupied && occupied.includes(newName)) {
    newName = name + '_' + n;
    n += 1;
  }
  return newName;
}

class AddItemMenu extends React.Component {
  onAddNode = (node2add) => {
    
    const { addNode } = this.props;
    const name = nameGen(
      node2add.schema.title,
      this.props.node.children.map((a) => a.schema.title)
    );
    console.log("node2add",node2add)
    addNode({ ...node2add, name });
  };
  render() {
    const {
      menu: { children: menuTree },
      menuOpenKeys,
      menuOpenChange,
    } = this.props;
    /* A modal can be added here that can ask for the title of the List element to be added. 
    Or a patch file will need to be replicated in the rjsf-patch for specific List element. */
    return (
      <Menu mode="inline" theme="dark" openKeys={menuOpenKeys} onOpenChange={menuOpenChange}>
        {menuTree.map((a) =>
          a.schema && a.schema.type === 'object' && a.children && a.children.length ? (
            <SubMenu key={a.key} title={a.schema.title || a.name}>
              {a.children.map((b) => (
                <Item key={b.key} onClick={() => this.onAddNode(b)}>
                  {b.schema.title || b.name}
                </Item>
              ))}
            </SubMenu>
          ) : (
            <Item key={a.key} onClick={() => this.onAddNode(a)}>
              {a.schema.title || a.name}
            </Item>
          )
        )}
      </Menu>
    );
  }
}

export default connect(
  ({ menu, menuOpenKeys }) => ({ menu, menuOpenKeys }),
  (dispatch, { node }) => ({
    addNode: (node2add) =>
      dispatch({
        type: 'TREE_ADD_NODE',
        payload: {
          targetNodeKey: node.key,
          position: 0,
          node2add,
        },
      }),
    menuOpenChange: (keys) =>
      dispatch({
        type: 'MENU_OPEN_KEYS_SET',
        payload: keys,
      }),
  })
)(AddItemMenu);
