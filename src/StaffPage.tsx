import React from "react"
// import ReactDOM from "react-dom"

export function StaffPage() {
  return (
    <div style={{ width: "100%" }} className="staffPage">
      <style
        dangerouslySetInnerHTML={{
          __html: `
      .line {
        display: block;
        width: 100%;
        height: 0;
        border-top: 1px solid black;
      }
      .space {
        display: block;
        height: 16px;
        background-color: white;
        width: 100%
      }
      .staffPage {
        background-color: white;
        position: fixed;
        top: 50%;
      }
      .measure {
        border-right: 1px solid black;
      }
    `,
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyItems: "center",
          alignItems: "center",
        }}
      >
        <StaffMeasure width="300px" height="80px" />
        <StaffMeasure width="300px" height="80px" />
        <StaffMeasure width="300px" height="80px" />
        <StaffMeasure width="300px" height="80px" />
      </div>
    </div>
  )
}

function StaffMeasure({ width, height }: any) {
  return (
    <div style={{ width, height, display: "flex", flexDirection: "column" }} className="measure">
      <div className="space"></div>
      <div className="fLine line"></div>
      <div className="eSpace space"></div>
      <div className="dLine line"></div>
      <div className="cSpace space"></div>
      <div className="bLine line"></div>
      <div className="aSpace space"></div>
      <div className="gLine line"></div>
      <div className="fSpace space"></div>
      <div className="eLine line"></div>
    </div>
  )
}
