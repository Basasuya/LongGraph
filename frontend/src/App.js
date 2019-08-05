import React from "react"
// import * as d3 from "d3"
import "./App.css"
import { Col, Row } from "antd"
import Snapshots from "./snapshots"
import Graph from "./graph"
import axios from 'axios';

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            snapshots: [],
            graph: {}
        }
    }

    handleLasso(chooseList) {
        console.log(chooseList)
        if(chooseList === []) {
            return
        } else {
            axios
            .post('http://localhost:5000/getUpdate', {'choose': chooseList}, { Accept: 'application/json', 'Content-Type': 'application/json'})
            .then((response) => {
                // console.log('hhhh')
                // console.log(response.data)
                this.setState({ graph: response.data})
            })
        }
    }

    handleHighLight(chooseId) {

    }
    componentDidMount() {
        axios
        .get('http://localhost:5000/getAll', { Accept: 'application/json', 'Content-Type': 'application/json'})
        .then((response) => {
            this.setState({ graph: response.data['layout'], snapshots: response.data['dimension'] })
        })

        // axios
        // .get('http://localhost:5000/getTSNE', { Accept: 'application/json', 'Content-Type': 'application/json','Access-Control-Allow-Origin': '*'})
        // .then((response) => {
        //     this.setState({ snapshots: response.data})
        // })

        // d3.json("./test_data.json").then(snapshots => {
        //     this.setState({
        //         snapshots: snapshots,
        //         graph: snapshots[0].graph
        //     })
        // })
    }

    render() {
        // const snapshots = this.state.snapshots
        // console.log('render!');
        const { graph } = this.state
        return (
            <div className="App">
                <Row>
                    <Col span={12}>
                        <Snapshots snapshots={this.state.snapshots} onLasso={this.handleLasso.bind(this)}/>
                    </Col>
                    <Col span={12}>
                        <Graph graph={graph} onHighLight={this.handleHighLight.bind(this)}/>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default App
