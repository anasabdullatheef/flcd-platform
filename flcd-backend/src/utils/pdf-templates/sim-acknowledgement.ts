const FLCbg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='; // Placeholder

export async function simReceiptModel(params: any) {
  const {
    type,
    date,
    riderName,
    signatureImage,
    nationality,
    idNumber,
    admin,
    phone,
  } = params;

  const signatureImageParse = signatureImage 
    ? `data:image/svg+xml;utf8,${encodeURIComponent(signatureImage)}`
    : '';

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 30px;
        background-image: url("${FLCbg}");
        background-size: 80%;
        background-position: center center;
        background-repeat: no-repeat;
      }

      .container {
        display: flex;
        flex-direction: column;
        width: 100%;
      }

      .row {
        display: flex;
        width: 100%;
        margin-bottom: 10px;
        align-items: center;
      }

      .cell {
        padding: 8px;
        display: flex;
        align-items: center;
      }

      .justify-center {
        justify-content: center;
      }

      .col-english,
      .col-arabic {
        flex: 1;
        text-align: left;
      }

      .col-center {
        flex: 2;
        text-align: center;
      }

      .rtl-text {
        direction: rtl;
      }

      .justify-text {
        text-align: justify;
      }

      .text-large {
        font-size: 18pt;
      }

      .text-medium {
        font-size: 16pt;
      }

      .text-small {
        font-size: 14pt;
      }

      .bold {
        font-weight: bold;
      }

      .term {
        margin-top: 30px;
        padding: 0px 30px;
      }

      .el-sign {
        margin-top: 15px;
        font-size: 12px;
        text-align: center;
      }

      .dynamic-content {
        text-align: center;
      }

      .bottom-section {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .bottom-section .cell {
        padding: 15px;
      }

      .border-bottom {
        border-bottom: 1px solid #000;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Acknowledgement Header -->
      <div class="row">
        <div class="cell col-english text-large bold border-bottom text-center justify-center">
          Receipt SIM
        </div>
        <div class="cell col-arabic text-large bold rtl-text border-bottom text-center justify-center">
          استلام SIM
        </div>
      </div>

      <!-- Rider Name and Nationality -->
      <div class="row">
        <div class="cell col-english text-medium bold">I:</div>
        <div class="cell col-center text-medium bold dynamic-content justify-center">
          ${riderName}
        </div>
        <div class="cell col-arabic text-medium bold rtl-text">اقرانا:</div>
      </div>
      <div class="row">
        <div class="cell col-english text-medium bold">Nationality:</div>
        <div class="cell col-center text-medium bold dynamic-content justify-center">
          ${nationality}
        </div>
        <div class="cell col-arabic text-medium bold rtl-text">الجنسية:</div>
      </div>
      <div class="row">
        <div class="cell col-english text-medium bold">ID number:</div>
        <div class="cell col-center text-medium bold dynamic-content justify-center">
          ${idNumber}
        </div>
        <div class="cell col-arabic text-medium bold rtl-text">رقم الهوية:</div>
      </div>

      <!-- Declaration Content -->
      <div class="row">
        <div class="cell col-english text-small justify-text border-bottom">
          <span>I have received the SIM for the cell phone from FLC DELIVERY SERVICES, provided that I use it within the scope of work for the company, and that I bear all legal responsibility for its use and the consequences thereof, and that I bear any additional cost outside the limits of 100 dirhams, and the company can deduct from Salary.</span>
        </div>
        <div class="cell col-arabic text-small justify-text rtl-text border-bottom">
          لقد استلمت بطاقة SIM للهاتف المحمول من FLC DELIVERY SERVICES، على أن أستخدمها ضمن نطاق العمل الخاص بالشركة، وأن أتحمل كافة المسؤولية القانونية عن استخدامها ونتائج المترتبة على ذلك، وأن أتحمل أي تكاليف إضافية خارج حدود 100 درهم، وأصرح للشركة خصم المبلغ من الراتب.
        </div>
      </div>
      <div class="row">
        <div class="cell col-english text-small justify-text border-bottom">
          <span>The SIM number of the cell phone is: ${phone}</span>
        </div>
        <div class="cell col-arabic text-small justify-text rtl-text border-bottom">
          رقم شريحة الهاتف الخلوي هي: ${phone}
        </div>
      </div>
      <div class="row">
        <div class="cell col-english text-small justify-text border-bottom">
          <span>I acknowledge and accept all terms and conditions stated above. I confirm that I understand the content written above and agree to abide by it. By signing below and providing my fingerprint, I confirm my understanding and acceptance of these terms.</span>
        </div>
        <div class="cell col-arabic text-small justify-text rtl-text border-bottom">
          أقر وأوافق على جميع الشروط والأحكام المذكورة أعلاه. أؤكد أنني أفهم المحتوى المكتوب أعلاه وأوافق على الالتزام به. من خلال التوقيع أدناه وتقديم بصمتي، أؤكد فهمي وقبولي لهذه الشروط.
        </div>
      </div>

      <div class="row">
        <div class="cell col-english text-small justify-text border-bottom">
          <span>The declaration was written in Arabic and English. In the event of any objection regarding the language, Arabic is preferred.</span>
        </div>
        <div class="cell col-arabic text-small justify-text rtl-text border-bottom">
          تم كتابة الإقرار باللغة العربية والإنجليزية. في حال وجود أي اعتراض بخصوص اللغة، تفضل اللغة العربية.
        </div>
      </div>

      <!-- Name and Signature -->
      <div class="row">
        <div class="cell col-english text-medium bold border-bottom">Name:</div>
        <div class="cell col-center text-medium bold border-bottom dynamic-content justify-center">
          ${riderName}
        </div>
        <div class="cell col-arabic text-medium bold rtl-text border-bottom">الاسم:</div>
        <div class="cell col-english text-medium bold border-bottom">Fingerprint:</div>
        <div class="cell col-center text-medium bold border-bottom"></div>
        <div class="cell col-arabic text-medium bold rtl-text border-bottom">البصمة:</div>
      </div>
      <div class="row">
        <div class="cell col-english text-medium bold border-bottom">Signature:</div>
        <div class="cell col-center text-medium bold border-bottom justify-center">
          ${type !== 'PRE_SIGNED' && signatureImageParse
            ? `<img src="${signatureImageParse}" alt="Signature" width="200" height="25"/>`
            : ''
          }
        </div>
        <div class="cell col-arabic text-medium bold rtl-text border-bottom">التوقيع:</div>
        <div class="cell col-english text-medium bold border-bottom">Date:</div>
        <div class="cell col-center text-medium bold border-bottom dynamic-content justify-center">
          ${type !== 'PRE_SIGNED' ? date : ''}
        </div>
        <div class="cell col-arabic text-medium bold rtl-text border-bottom">التاريخ:</div>
      </div>
      <div class="row">
        <div class="cell col-english text-medium bold border-bottom">Done with knowledge:</div>
        <div class="cell col-english text-medium border-bottom">&nbsp;</div>
        <div class="cell col-arabic text-medium bold rtl-text border-bottom">تم بمعرفة:</div>
      </div>
      <div class="row bottom-section">
        <div class="cell col-english text-medium bold border-bottom">Name:</div>
        <div class="cell col-center text-medium bold border-bottom dynamic-content justify-center">
          ${admin}
        </div>
        <div class="cell col-arabic text-medium bold rtl-text border-bottom">الاسم:</div>
        <div class="cell col-english text-medium bold border-bottom">Signature:</div>
        <div class="cell col-center text-medium bold border-bottom"></div>
        <div class="cell col-arabic text-medium bold rtl-text border-bottom">التوقيع:</div>
      </div>

      <!-- Signature Info -->
      <div class="term">
        <p class="el-sign">
          The documents were signed online using electronic signature technology
          through Cryptographically Secured Electronic Signature technology,
          ensuring that the electronic version is legally valid, authentic, and
          usable. Additionally, the website has approved the use of this
          technology, further confirming its validity and compliance with
          applicable legal standards.
        </p>
        <p class="el-sign">
          تم توقيع هذه الوثائق عبر الإنترنت باستخدام تقنية التوقيع الإلكتروني من
          خلال تكنولوجيا التوقيع الإلكتروني المشفر، مما يضمن أن النسخة
          الإلكترونية لها أصل قانوني وصحيحة وقابلة للاستخدام. كما أن الموقع
          الإلكتروني قد وافق على استخدام هذه التقنية، مما يعزز صحتها وامتثالها
          للمعايير القانونية المعمول بها.
        </p>
      </div>
    </div>
  </body>
</html>`;

  return html;
}