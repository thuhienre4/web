from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from xml.sax.saxutils import escape

OUT = Path(__file__).with_name("google-sheet-deals-template.xlsx")

rows = [
    ["brand", "title", "type", "code", "discount", "link", "category", "expiry", "review", "status"],
    ["Jessie Boutique", "Jessie Boutique Coupon Code JESSIE20 - 15% OFF", "code", "JESSIE20", "15% OFF", "https://www.jessieboutique.com/?rfsn=YOUR_AFFILIATE_ID", "Fashion", "Limited time", "15% Off Storewide at Jessie Boutique", "published"],
    ["Display NOW", "Display NOW Coupon Code BONUS101Y - 10% OFF", "code", "BONUS101Y", "10% OFF", "https://referral.displaynow.io/?rfsn=YOUR_AFFILIATE_ID", "Software", "2026-12-31", "10% Off Annual Subscription at Display NOW", "published"],
    ["Reflex Nutrition", "Reflex Nutrition Deal - Only £34.99", "deal", "", "Only £34.99", "https://reflexnutrition.com/discount/YOUR_CODE?ref=YOUR_AFFILIATE_ID", "Health & Wellness", "Limited time", "Only £34.99 with Instant Whey Pro", "published"],
    ["Aurora Gift", "Aurora Gift Deal - 30% OFF", "deal", "", "30% OFF", "https://auroragift.com/?rfsn=YOUR_AFFILIATE_ID", "Gifts", "Limited time", "30% Off America Spirits", "draft"],
]

categories = [
    "Fashion",
    "Software",
    "Health & Wellness",
    "Beauty & Spa",
    "Home Goods",
    "Pets",
    "Safety & Emergency",
    "Gifts",
]


def col_name(n):
    name = ""
    while n:
        n, rem = divmod(n - 1, 26)
        name = chr(65 + rem) + name
    return name


def sheet_data(matrix):
    output = ["<sheetData>"]
    for row_index, row in enumerate(matrix, start=1):
        output.append(f'<row r="{row_index}">')
        for col_index, value in enumerate(row, start=1):
            cell = f"{col_name(col_index)}{row_index}"
            style = ""
            if row_index == 1:
                style = ' s="1"'
            elif col_index == 10 and value == "published":
                style = ' s="2"'
            elif col_index == 10 and value == "draft":
                style = ' s="3"'
            output.append(f'<c r="{cell}" t="inlineStr"{style}><is><t>{escape(str(value))}</t></is></c>')
        output.append("</row>")
    output.append("</sheetData>")
    return "".join(output)


sheet1 = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
  <cols>
    <col min="1" max="1" width="20" customWidth="1"/>
    <col min="2" max="2" width="48" customWidth="1"/>
    <col min="3" max="5" width="16" customWidth="1"/>
    <col min="6" max="6" width="58" customWidth="1"/>
    <col min="7" max="10" width="22" customWidth="1"/>
  </cols>
  {sheet_data(rows)}
  <autoFilter ref="A1:J5"/>
  <dataValidations count="2">
    <dataValidation type="list" allowBlank="1" showErrorMessage="1" sqref="C2:C500"><formula1>"code,deal"</formula1></dataValidation>
    <dataValidation type="list" allowBlank="1" showErrorMessage="1" sqref="J2:J500"><formula1>"published,draft"</formula1></dataValidation>
  </dataValidations>
</worksheet>'''

category_rows = [["category", "notes"], *[[cat, "Use this exact label for site highlight colors"] for cat in categories]]
sheet2 = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <cols><col min="1" max="1" width="26" customWidth="1"/><col min="2" max="2" width="42" customWidth="1"/></cols>
  {sheet_data(category_rows)}
</worksheet>'''

parts = {
    "[Content_Types].xml": '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>''',
    "_rels/.rels": '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>''',
    "xl/workbook.xml": '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Deals" sheetId="1" r:id="rId1"/><sheet name="Categories" sheetId="2" r:id="rId2"/></sheets>
</workbook>''',
    "xl/_rels/workbook.xml.rels": '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>''',
    "xl/worksheets/sheet1.xml": sheet1,
    "xl/worksheets/sheet2.xml": sheet2,
    "xl/styles.xml": '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Calibri"/></font></fonts>
  <fills count="5"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF08764F"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFDDF8EA"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFE4E6"/></patternFill></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/><xf numFmtId="0" fontId="0" fillId="3" borderId="0" xfId="0" applyFill="1"/><xf numFmtId="0" fontId="0" fillId="4" borderId="0" xfId="0" applyFill="1"/></cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>''',
    "docProps/core.xml": '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>AloCoupon Google Sheet Deals Template</dc:title><dc:creator>Codex</dc:creator></cp:coreProperties>''',
    "docProps/app.xml": '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>AloCoupon</Application></Properties>''',
}

with ZipFile(OUT, "w", ZIP_DEFLATED) as zf:
    for name, content in parts.items():
        zf.writestr(name, content)

print(OUT)
