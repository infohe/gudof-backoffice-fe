import React, { Component } from 'react';
import { Provider, connect } from "react-redux";
import './css';
import { Layout, Tabs, Card } from 'antd';
import Tree from './Tree';
import { FormView, SchemaView, UiSchemaView, FormDataView } from './views';
import Toolbar from './Toolbar';
import Settings from './Settings';
const { Header, Sider, Content } = Layout;
const { TabPane } = Tabs;

class NewTemplate extends Component {
    state = {
        collapsed: false,
    };
    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    };
    render() {
        const { settings } = this.props;
        return (
            <Layout>
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={this.state.collapsed}
                    width={settings.leftSiderWidth}
                    style={{
                        background: '#fff',
                        padding: 0,
                        overflow: 'auto',
                        boxShadow: '0 2px 3px 0 rgba(0, 0, 0, 0.2), 0 2px 3px 0 rgba(0, 0, 0, 0.2)',
                        height: '100vh',
                        position: 'fixed',
                        left: 0,
                    }}
                >
                    <Tabs defaultActiveKey="0" size="small" type="card">
                        <TabPane tab="Editor" style={{ padding: '8px' }} key="0">
                            <Tree />
                        </TabPane>
                        <TabPane tab="Settings" style={{ padding: '8px' }} key="1">
                            <Settings />
                        </TabPane>
                    </Tabs>
                </Sider>
                <Layout style={{ marginLeft: settings.leftSiderWidth }}>
                    <Header style={{ background: '#fff', padding: 0 }}>
                        <Toolbar />
                    </Header>
                    <Content style={{ minHeight: 280, padding: '12px 8px' }}>
                        <Card
                            bordered={false}
                            style={{ width: settings.formWidth, margin: '12px 8px', display: 'inline-block', verticalAlign: 'top' }}
                        >
                            <FormView />
                        </Card>
                        {(settings.subViews || []).map((a) => {
                            const style = { margin: '12px 8px', width: 400, display: 'inline-block', verticalAlign: 'top' };
                            switch (a) {
                                case 'schema':
                                    return (
                                        <Card key="schema" title="Schema" style={style}>
                                            <SchemaView />
                                        </Card>
                                    );
                                // case 'uiSchema':
                                //     return (
                                //         <Card key="uiSchema" title="Ui Schema" style={style}>
                                //             <UiSchemaView />
                                //         </Card>
                                //     );
                                case 'formData':
                                    return (
                                        <Card key="formData" title="Form Data" style={style}>
                                            <FormDataView />
                                        </Card>
                                    );
                                default:
                                    return <div key="null" />;
                            }
                        })}
                    </Content>
                </Layout>
            </Layout>
        );
    }
}

export default connect(({ activeNodeKey, settings }) => ({
  activeNodeKey,
  settings,
}))(NewTemplate);

// export default NewTemplate;