/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { onMount, createSignal, createEffect, batch } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import { createLocalStore, getRandomColor } from 'krestianstvo'
import { createCodeMirror, createEditorControlledValue } from 'solid-codemirror';
import { EditorView, lineNumbers, Decoration } from '@codemirror/view';
import { markdown } from "@codemirror/lang-markdown";
import { javascript } from "@codemirror/lang-javascript";
import { basicLight } from 'cm6-theme-basic-light'
import { ChangeSet, Text, StateEffect, StateField } from "@codemirror/state"
import { collab, receiveUpdates, sendableUpdates, getSyncedVersion, getClientID } from "@codemirror/collab"
import { useKeyDownList } from "@solid-primitives/keyboard";
import { hex2rgb, rgbaString } from './Utils';

export default function CodeMirror(props) {

  const [local, setLocal] = createLocalStore({
    data: {
      type: "Node",
      nodeID: props.nodeID,
      properties: props.properties ? props.properties : {
        name: props.name ? props.name : props.nodeID,
        text: props.text ? props.text : "enter text here",
        ticking: false,
        initialized: false,
        dynamic: props.dynamic ? props.dynamic : false,
        parentID: props.parentID ? props.parentID : null,
        containerID: props.containerID ? props.containerID : null,
        targetID: props.targetID ? props.targetID : null,
        language: props.language ? props.language : null,
      },
      dynamic: [
      ],
      cursors: {},
      oldCursors: {},
      cursorsColors: {}
    }
  }, props);


  createEffect(() => {

    let diff = Object.keys(local.data.cursors).filter(x => !props.selo.storeNode.clients.includes(x));

    diff.length > 0 ? diff.forEach(av => {
      setLocal(produce((s) => {
        let cursor = s.data.cursors[av]
        if (cursor) {
          s.data.cursors[av] = null
          delete s.data.cursors[av]

          if (s.data.cursorsColors[av]) {
            s.data.cursorsColors[av] = null
            delete s.data.cursorsColors[av]
          }

          if (editorView()) {
            editorView().dispatch({
              effects: filterMarks.of((from, to, value) => value.spec.clientID !== av)
            })
          }
        }
      }))
    }) : null
  })

  const [code, setCode] = createSignal();
  const [keys, { event }] = useKeyDownList();
  const cursorKeys = ['ARROWLEFT', 'ARROWRIGHT', 'ARROWDOWN', 'ARROWUP', 'BACKSPACE', 'ENTER']

  createEffect(() => {

    //console.log(keys())
    // let key = keys()[0]
    let key = keys().filter(x => cursorKeys.includes(x))[0]
    if (cursorKeys.includes(key)) {
      setTimeout(() => {
        let pos = editorView().state.selection.ranges[0].from
        props.selo.sendExtMsg({ msg: "cursorPosition", id: props.nodeID, params: [pos, props.selo.storeVT.moniker_] })
      }, 1)
    }
  })

  const step = (tick) => { }


  const initialize = () => { }

  let [sync, setSync] = createSignal(false)

  createEffect(() => {

    if (props.selo.storeVT.stateSynced && sync() !== true) {
      setCode(local.data.properties.text)
      setSync(true)
    }

  })


  const [cur, setCur] = createStore({
    oldCursors: {}
  })


  createEffect(() => {

    if (editorView()) {

      Object.entries(local.data.cursors).forEach(el => {
        let pos = el[1] - 1

        let old = cur.oldCursors[el[0]]

        if (old !== el[1]) {
          // ||  (props.selo.storeNode.clients.length - Object.values(local.data.cursors).length == 1)){

          let avatarNode = props.selo.getNodeByID(el[0])
          let colorHex = avatarNode ? avatarNode.data.properties.color : local.data.cursorsColors[el[0]] ? local.data.cursorsColors[el[0]] : "#fc5151"
          let color = hex2rgb(colorHex)
          let colorCSS = rgbaString(Object.assign(color, { a: 0.1 }))

          // "border-left: 0.2rem solid " + colorHex + "; "
          const hd = Decoration.mark({
            attributes: {
              style:
                "background-color: " + colorCSS + "; " +
                "border-right: 0.2rem solid " + colorHex + "; "

            },
            clientID: el[0],
            //class: 'red_back'
          });

          editorView().dispatch({
            effects: filterMarks.of((from, to, value) => value.spec.clientID !== el[0])
          })


          editorView().dispatch({
            effects: highlight_effect.of([hd.range(pos, pos + 1)])
          });
          setCur("oldCursors", el[0], el[1])
        }
      })
    }
  })

  onMount(() => {
    setCode(local.data.properties.text)
  })

  const createCursor = () => {
    if (!local.data.cursors[props.selo.storeVT.moniker_])
      props.selo.sendExtMsg({ msg: "cursorPosition", id: props.nodeID, params: [1, props.selo.storeVT.moniker_] })
    //cursorPosition([1, null, props.selo.storeVT.moniker_])
  }

  const postInitialize = () => {

    // editorView().dispatch({
    //   changes: {from: 0, to: editorView().state.doc.length, insert: local.data.properties.text}
    // })

    props.selo.future(props.nodeID, "createCursor", 0, [])

    if (local.data.properties.targetID) {
      let node = props.selo.getNodeByID(local.data.properties.targetID)
      if (node) {
        node.setActions["updateSource"]([local.data.properties.text])
      }
    }

    // setLocal(produce((s)=>{
    //   Object.entries(s.data.cursors).forEach((el=>{
    //     if(props.selo.storeNode.clients.includes(el[0]))
    //         cursorPosition([el[1], el[0]])
    //   }))
    // }))

  }

  const doesNotUnderstand = (data) => {
    console.log("MY doesNotUnderstand action: ", data)
  }

  const pushUpdates = (msg) => {
    let updates = msg[0]

    let newUpdates = []
    for (let update of updates) {
      // Convert the JSON representation to an actual ChangeSet
      // instance
      let changes = ChangeSet.fromJSON(update.changes)
      let newUpdate = { changes: changes, clientID: update.clientID }
      newUpdates.push(newUpdate)
    }

    //editorView().state.selection.main.head

    editorView().dispatch(receiveUpdates(editorView().state, newUpdates))
    setLocal("data", "properties", "text", editorView().state.doc.toString())
    cursorPosition([msg[2], msg[1]])

    if (local.data.properties.targetID) {
      let node = props.selo.getNodeByID(local.data.properties.targetID)
      if (node && local.data.properties.text !== node.data.properties.source)
        node.setActions["updateSource"]([local.data.properties.text])
    }
  }

  function handleUpdate(msg) {

    let fullUpdates = sendableUpdates(editorView().state)
    console.log("UPDATES: ", fullUpdates)

    let pos = editorView().state.selection.ranges[0].from
    fullUpdates.forEach((u => {
      let upd = {
        clientID: u.clientID,
        changes: u.changes.toJSON()
      }
      props.selo.sendExtMsg({ msg: "pushUpdates", id: props.nodeID, params: [[upd], props.selo.storeVT.moniker_, pos] })
    }))

  }

  const cursorPosition = (msg) => {

    let data = Array.isArray(msg[0]) ? msg[0] : msg

    //let pos = data[0] - 1

    let avatarNode = props.selo.getNodeByID(data[1])
    if (!avatarNode) {
      if (!local.data.cursorsColors[data[1]])
        setLocal("data", "cursorsColors", data[1], getRandomColor(props.selo))
    }

    setLocal("data", "cursors", data[1], data[0])
  }

  props.selo.createAction(props.nodeID, "doesNotUnderstand", doesNotUnderstand, true)
  props.selo.createAction(props.nodeID, "step", step)
  props.selo.createAction(props.nodeID, "initialize", initialize)
  props.selo.createAction(props.nodeID, "postInitialize", postInitialize)

  props.selo.createAction(props.nodeID, "pushUpdates", pushUpdates)
  props.selo.createAction(props.nodeID, "handleUpdate", handleUpdate)
  props.selo.createAction(props.nodeID, "cursorPosition", cursorPosition)
  props.selo.createAction(props.nodeID, "createCursor", createCursor)


  const { editorView, ref: editorRef, createExtension } = createCodeMirror({

    value: local.data.properties.text,
    onValueChange: setCode,
    //  onValueChange: (value) => {
    //   // if(local.data.properties.text !== value)
    //   //   handleTextInput(value)
    //  },
    onModelViewUpdate: (modelView) => {
      if (modelView.docChanged) {
        // && local.data.properties.text !== editorView().state.doc.toString()
        if (props.selo.storeVT.stateSynced)
          handleUpdate()
      }
    },
  })

  createEditorControlledValue(editorView, code);

  const lw = EditorView.lineWrapping
  const [showLineNumber, setShowLineNumber] = createSignal(false);

  let baseTheme = EditorView.baseTheme({
    "&light .red_back": {
      "background-color": "rgba(255, 0, 255, 0.2)",
      "border-left": "0.15rem solid red",
      height: "30px"
      // "outline": "2px solid blue"
    },
    "&light": {
      background: "rgba(255, 255, 255)",
      opacity: 0.95,
      border: "0.01rem solid gray",
      fontSize: "14pt"
    },
    "&light .cm-content": { minWidth: "300px", minHeight: "200px", caretColor: "#ad3100" },
    "&light .cm-gutter": { minHeight: "200px" },
    "&light  .cm-scroller": {
      overflow: "auto",
      maxHeight: "600px"
    }
  })


  const highlight_effect = StateEffect.define();
  const filterMarks = StateEffect.define()

  const highlight_extension = StateField.define({
    create() { return Decoration.none },
    update(value, transaction) {
      value = value.map(transaction.changes)

      for (let effect of transaction.effects) {
        const char = effect.value;
        if (effect.is(highlight_effect) && char[0].from <= transaction.state.doc.length - 1) {
          value = value.update({ add: effect.value, sort: true })
        }
        else if (effect.is(filterMarks)) {
          value = value.update({ filter: effect.value })
        }
      }
      return value
    },
    provide: f => EditorView.decorations.from(f)
  });

  createExtension(baseTheme);
  createExtension(basicLight);
  createExtension(lw);
  createExtension(collab(0));
  createExtension(highlight_extension);

  //createExtension(markdown().language); 

  // Toggle extension
  createExtension(() => showLineNumber() ? lineNumbers() : []);
  createExtension(() => local.data.properties.language == "markdown" ? markdown().language : []);
  createExtension(() => local.data.properties.language == "js" ? javascript() : []);

  function clieckEvent(e) {

    let coords = { x: e.clientX, y: e.clientY }
    let pos = editorView().posAtCoords(coords)
    props.selo.sendExtMsg({ msg: "cursorPosition", id: props.nodeID, params: [pos, props.selo.storeVT.moniker_] })

  }

  return (
    <>
      <div ref={editorRef} onClick={clieckEvent} />
    </>
  )

}
