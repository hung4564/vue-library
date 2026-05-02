type JSONPrimitive = string | number | boolean | null;
type JSONValue = JSONPrimitive | JSONObject | JSONArray;
interface JSONObject {
  [key: string]: JSONValue;
}
type JSONArray = Array<JSONValue>;
export type { JSONArray, JSONObject, JSONPrimitive, JSONValue };

export type ComponentType = {
  componentKey: string;
  attr?: JSONObject;
};
