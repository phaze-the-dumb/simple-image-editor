import { For, Match, Show, Switch } from "solid-js";
import { Layer } from "../classes/Layer"

let propertiesFromLayer = ( layer: Layer ): HTMLElement => {
  let propertyTypes = Object.values(layer.editableProperties);

  return (
    <>
      <h2>{ layer.name }</h2>

      <For each={ Object.keys(layer.editableProperties) }>
        { ( item, index ) =>
          <div>
            {item}: 
            <Switch>
              <Match when={propertyTypes[index()] === "colour"}>
                {/* @ts-ignore */}
                <input type="color" value={ layer[item.toLowerCase()] } onChange={( e ) => {
                  // @ts-ignore
                  layer[item.toLowerCase()] = e.target.value
                }} />
              </Match>
              <Match when={propertyTypes[index()] === "text"}>
                {/* @ts-ignore */}
                <input type="text" value={ layer[item.toLowerCase()] } onChange={( e ) => {
                  // @ts-ignore
                  layer[item.toLowerCase()] = e.target.value
                }} />
              </Match>
              <Match when={propertyTypes[index()] === "int"}>
                {/* @ts-ignore */}
                <input type="number" value={ layer[item.toLowerCase()] } onChange={( e ) => {
                  // @ts-ignore
                  layer[item.toLowerCase()] = parseInt(e.target.value)
                }} />
              </Match>
              <Match when={propertyTypes[index()] === "bool"}>
                {/* @ts-ignore */}
                <input type="checkbox" checked={ layer[item.toLowerCase()] } onChange={( e ) => {
                  console.log(e.target.checked);
                  // @ts-ignore
                  layer[item.toLowerCase()] = e.target.checked
                }} />
              </Match>
            </Switch>

            <br />
          </div>
        }
      </For>

      <Show when={layer.selectable}>
        <br />
        <h3>Bounds:</h3>

        X: <input type="number" value={ layer.bounds.x } onInput={( e ) => {
          layer.bounds.x = parseInt(e.target.value)
        }} />&nbsp;&nbsp;

        Y: <input type="number" value={ layer.bounds.y } onInput={( e ) => {
          layer.bounds.y = parseInt(e.target.value)
        }} /><br /><br />

        Width: <input type="number" value={ layer.bounds.width } onInput={( e ) => {
          layer.bounds.width = parseInt(e.target.value)
        }} />&nbsp;&nbsp;

        Height: <input type="number" value={ layer.bounds.height } onInput={( e ) => {
          layer.bounds.height = parseInt(e.target.value)
        }} /><br /><br />
      </Show>
    </>
  ) as HTMLElement
}

export { propertiesFromLayer };