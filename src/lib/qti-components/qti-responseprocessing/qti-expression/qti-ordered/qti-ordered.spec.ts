import "./qti-ordered";
import "../qti-basevalue/qti-basevalue";
import { QtiOrdered } from "./qti-ordered";
import { html, render } from "lit";
import { describe, expect, it } from "@jest/globals";
describe("qti-ordered", () => {
  it("should return an array with the calculated results of its children, single child", () => {
    const template = () => html`
      <qti-ordered>
        <qti-base-value base-type="identfier">DriverC</qti-base-value>
        <qti-base-value base-type="identfier">DriverB</qti-base-value>
        <qti-base-value base-type="identfier">DriverA</qti-base-value>
      </qti-ordered>
    `;
    render(template(), document.body);

    const qtiOrdered = document.body.querySelector("qti-ordered") as QtiOrdered;
    const calculated = qtiOrdered.calculate();
    expect(calculated[0].value).toMatch("DriverC");
  });

  it("should return an array with the calculated results of its children, 3 children", () => {
    const template = () => html`
      <qti-ordered>
        <qti-base-value base-type="identfier">DriverC</qti-base-value>
        <qti-base-value base-type="identfier">DriverB</qti-base-value>
        <qti-base-value base-type="identfier">DriverA</qti-base-value>
      </qti-ordered>
    `;
    render(template(), document.body);

    const qtiOrdered = document.body.querySelector("qti-ordered") as QtiOrdered;
    const calculated = qtiOrdered.calculate();
    expect(calculated[2].value).toMatch("DriverA");
  });
});
