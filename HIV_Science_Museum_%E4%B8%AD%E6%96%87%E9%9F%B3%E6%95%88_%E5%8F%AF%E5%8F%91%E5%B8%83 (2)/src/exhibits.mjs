export const museum = {
  title: 'HIV 科学小馆',
  subtitle: '九台会动的机器，讲清 HIV 如何传播、如何预防。',
  disclaimer: '这些模拟用于健康教育，解释已确立的 HIV 传播与预防原理。它们不能诊断 HIV 感染，也不能计算个人感染概率。'
};

export const exhibits = [
  {
    id:'01_hiv_basics', name:'HIV 与 AIDS 发现机', en:'HIV & AIDS Discovery', room:'免疫系统', time:16.4, frame:'比较 CD4 计数阈值',
    question:'HIV 怎样影响免疫系统？感染 HIV 和患有 AIDS 有什么区别？',
    titleId:'lesson', idle:'操作样本盘，观察 HIV 对 CD4 T 细胞的影响，再比较两条 AIDS 判定依据。',
    big:'HIV 是病毒，AIDS 是 HIV 感染的晚期；治疗有助于保护免疫系统。',
    steps:[
      ['Meet CD4 T cells','认识 CD4 T 细胞','样本盘升起。CD4 T 细胞协调免疫反应，帮助身体抵御感染。'],
      ['See how HIV affects cells','观察 HIV 如何影响细胞','HIV 可感染 CD4 T 细胞。未经治疗，CD4 细胞可能随时间减少，免疫系统也可能受损。'],
      ['Test the CD4 cutoff','比较 CD4 计数阈值','在已确诊 HIV 的成人教学案例中，CD4 低于 200 个/mm³ 满足一项 AIDS 判定标准。恰好 200 不满足这一项。仪表中的读数是虚构教学样本。'],
      ['Check a defining illness','查看 AIDS 定义性疾病','已确诊 HIV 的人出现 AIDS 定义性疾病，如肺孢子菌肺炎，即使 CD4 未低于阈值，也可能据此判定 AIDS。'],
      ['Watch ART suppress HIV','观察 ART 抑制复制','抗逆转录病毒治疗（ART）抑制 HIV 复制，使免疫系统有机会恢复。ART 可以控制 HIV 感染，不能根治。'],
      ['Reset the viewer','复位观察机','样本盘和判定机构回到初始位置。']
    ]
  },
  {
    id:'02_hiv_fluids', name:'体液分类机', en:'Body Fluid Classification', room:'传播条件', time:15.6, frame:'体液进入黏膜暴露通道',
    question:'哪些体液在特定条件下可能传播 HIV？', titleId:'noteTitle',
    idle:'转动样本转盘，比较不同体液和接触途径。',
    big:'HIV 传播需要具有传染性的体液，并且这类体液要接触合适的进入部位。',
    steps:[
      ['Meet the carousel','清点体液样本','血液、精液、射精前分泌液、直肠分泌液、阴道分泌液和乳汁，在符合传播条件时可能传播 HIV。'],
      ['Same fluid, different route','比较血液接触途径','含有可传播 HIV 的血液接触完整皮肤，没有相应的进入途径。污染锐器刺破皮肤则可能造成暴露。'],
      ['Check the sexual-fluid route','转到性接触相关体液','在阴道性交或肛交过程中，具有传染性的体液接触易受感染的黏膜，可能形成暴露。'],
      ['A feeding route','查看乳汁途径','HIV 可以通过母乳喂养传给婴儿。HIV 治疗及个体化的喂养指导可以降低风险。'],
      ['Everyday contact is safe','检查日常接触','汗液、眼泪或唾液本身不会传播 HIV。拥抱、共餐等日常接触可以照常进行。'],
      ['Return the carousel','复位分类机','转盘回到初始位置，示意通道关闭。']
    ]
  },
  {
    id:'03_hiv_pathways', name:'传播路径机', en:'Transmission Pathways', room:'传播条件', time:22.2, frame:'完整皮肤挡住示意颗粒',
    question:'HIV 需要怎样的进入途径？完整皮肤为什么能起到屏障作用？', titleId:'title',
    idle:'依次打开三个通道，再比较完整皮肤和普通社交接触。',
    big:'HIV 需要合适的体液和进入途径。握手、拥抱和共餐不会传播 HIV。',
    steps:[
      ['Mucous membrane','打开黏膜通道','具有传染性的体液接触某些黏膜可能造成暴露，例如性交时接触阴道或直肠黏膜。'],
      ['Damaged tissue','打开受损组织通道','含有可传播 HIV 的血液接触受损组织时，可能形成暴露。'],
      ['Direct to bloodstream','打开血液通道','共用受污染的注射器具，可能将具有传染性的血液直接引入血液循环。'],
      ['Intact skin','测试完整皮肤','颗粒停在屏障外。仅接触完整皮肤，没有相应的 HIV 进入途径。'],
      ['Everyday contact','检查日常接触','握手、拥抱和普通共餐都不会传播 HIV。'],
      ['Reset','复位传播路径机','选择器和通道回到初始位置。']
    ]
  },
  {
    id:'04_hiv_sexual_prevention', name:'性传播预防机', en:'Sexual Transmission Prevention', room:'预防工具', time:24.45, frame:'并排比较安全套与 PrEP',
    question:'安全套和暴露前预防用药（PrEP）分别怎样降低风险？', titleId:'title',
    idle:'启动样本泵，对照实体屏障与细胞内的药物作用。',
    big:'安全套减少体液接触；PrEP 帮助阻止 HIV 在暴露后建立感染。',
    steps:[
      ['Trace an exposure','跟踪一次可能暴露','样本泵把体液送到黏膜模型。特定体液接触黏膜可能造成暴露，实际暴露不代表一定感染。'],
      ['Slide the condom barrier','滑下安全套屏障','正确、持续使用安全套，可减少具有传染性的体液接触黏膜。'],
      ['Activate the PrEP model','启动 PrEP 模型','PrEP 是暴露前预防用药。按医嘱使用时，药物干预 HIV 建立感染所需的步骤。'],
      ['Compare both protections','比较两种保护','一边是减少体液接触的物理屏障，另一边是已按医嘱使用的药物在细胞内发挥作用。'],
      ['Read the evidence','读取 CDC 估计','CDC 估计，按医嘱使用 PrEP 可将经性接触感染 HIV 的风险降低约 99%。这是相对风险降幅，并非个人感染概率。'],
      ['Reset the machine','复位预防机','样本泵、保护膜和细胞观察窗回到待机。']
    ]
  },
  {
    id:'05_hiv_blood_safety', name:'血液暴露安全机', en:'Blood Exposure Safety', room:'预防工具', time:22.3, frame:'打开历史研究数据抽屉',
    question:'如何防止锐器伤？历史职业暴露数据究竟测量了什么？', titleId:'heading',
    idle:'在密闭剖面内比较暴露锐器、安全护套和历史研究数据。',
    big:'用过的锐器可能把血液带入皮下；安全器具和及时报告有助于保护医护人员。',
    steps:[
      ['Blood in the chamber','装载教学血液样本','珊瑚色符号表示示意血样。血液只接触完整皮肤时，没有相应的进入途径。'],
      ['A route through the skin','比较无护套锐器','锐器刺破皮肤时可能带入血液。可能暴露和感染是两个不同的判断。'],
      ['Keep the sharp covered','启动安全护套','启用器具的安全功能，并将使用过的锐器及时投入防穿刺容器。避免用手回套针帽。'],
      ['What the estimate measures','查看历史数据','美国职业暴露指南引用的历史平均估计约为 0.23%，即每 10,000 次接触 HIV 感染者血液的经皮暴露约有 23 例感染。个体评估还取决于伤口、血液量、病毒载量和暴露后处理。'],
      ['Act promptly after a sharps injury','报告锐器暴露','用肥皂和清水清洗针刺处，立即按工作场所流程报告并寻求医疗评估。是否需要 PEP 由医务人员判断。'],
      ['Back to standby','复位安全机','报告旗和样本滑车归位。']
    ]
  },
  {
    id:'06_hiv_perinatal', name:'母婴传播预防机', en:'Mother-to-Child Prevention', room:'预防工具', time:19, frame:'分别标记孕产期数据与喂养路径',
    question:'在妊娠、分娩和喂养三个阶段，可以怎样减少 HIV 传播？', titleId:'heading',
    idle:'沿着三个观察窗查看孕期、分娩及婴儿喂养。',
    big:'孕期和分娩期的规范照护可以保护婴儿，出生后还需要单独制定喂养计划。',
    steps:[
      ['During pregnancy','查看妊娠阶段','妊娠期间 HIV 可能经胎盘传播。产前检测可帮助及早获得治疗和病毒载量监测。'],
      ['Treatment during pregnancy','观察孕期治疗','ART 抑制 HIV 复制。孕期按医嘱用药并监测病毒载量，有助于减少传播。'],
      ['During labor and birth','查看分娩阶段','根据美国 NIH 指南，孕期接受 ART、且临近分娩时记录到 HIV RNA 低于 50 copies/mL，妊娠和分娩传播风险可降至 1% 或更低。新生儿还需要按情况接受预防用药和随访。'],
      ['After birth','查看婴儿喂养','HIV 可能经乳汁传播。持续治疗和病毒抑制可以降低喂养期风险，仍需与照护团队单独评估喂养选择和监测。'],
      ['Return to the start','复位预防机','三个窗口归位。每个阶段需要的照护各有不同。']
    ]
  },
  {
    id:'07_hiv_pep', name:'PEP 紧急时钟', en:'PEP Emergency Timeline', room:'暴露后与治疗', time:15.2, frame:'指针扫向暴露后 72 小时标记',
    question:'可能暴露于 HIV 后，应多快就医评估？PEP 疗程一般多久？', titleId:'heading',
    idle:'比较两块时钟，一块显示暴露后经过的小时数，另一块显示用药天数。',
    big:'可能暴露后应尽快就医；如有指征，及时开始并按医嘱完成 PEP。',
    steps:[
      ['Start the exposure clock','启动暴露时钟','可能发生 HIV 暴露后，请尽快寻求专业医疗评估。'],
      ['Open the assessment gate','打开临床评估门','医务人员判断是否需要暴露后预防用药（PEP）。如有指征，应尽早启动，理想是在 24 小时内；不因等待化验结果而推迟。'],
      ['Compare the time window','比较启动时间窗','美国 CDC 的非职业暴露指南建议，在有指征时最迟于暴露后 72 小时内开始 PEP。应尽快就医。'],
      ['Check a later arrival','查看超过时间窗的示例','超过 72 小时通常不建议启动 PEP，仍应就医。医务人员可以安排检测、预防咨询和个体化随访。'],
      ['Run the course calendar','运行疗程日历','日历回到较早就医且符合用药指征的示例。标准 PEP 疗程为 28 天，请按医嘱完成用药和随访。'],
      ['Reset the machine','复位时钟','暴露时钟和疗程日历归位。']
    ]
  },
  {
    id:'08_hiv_art_uu', name:'ART 与 U=U 病毒载量机', en:'ART & U=U Viral Load', room:'暴露后与治疗', time:24.55, frame:'持续病毒抑制点亮 U=U 指示灯',
    question:'持续有效治疗如何预防 HIV 经性接触传播？', titleId:'note-title',
    idle:'跟踪复制轮、载量仪表和两枚随访记录标记。',
    big:'有效治疗将病毒载量持续维持在 200 copies/mL 以下，就能防止 HIV 经性接触传播。',
    steps:[
      ['Inside an infected cell','查看感染细胞','HIV 可在感染细胞内复制。病毒载量检测测量血液样本中的 HIV RNA。'],
      ['Treatment slows copying','启动 ART','有效的抗逆转录病毒治疗（ART）抑制复制，病毒载量会随治疗下降。'],
      ['One result below the line','读取一次检测结果','示例中一次低于阈值的结果，还不能说明病毒载量已经持续受到抑制。'],
      ['Exactly on the line','检查阈值边界','恰好 200 copies/mL 不满足 NIH 指南中严格低于 200 的条件。这是一个独立的教学示例。'],
      ['Suppression over time','确认持续病毒抑制','接受有效 ART 并将病毒载量持续维持在 200 copies/mL 以下，可防止 HIV 经性接触传播，这就是 U=U。'],
      ['What U=U covers','查看 U=U 的适用范围','U=U 的这一结论适用于性传播。母乳喂养和共用注射器具需要分别评估。'],
      ['Return to standby','复位载量机','载量指针、实验室标记和抽屉归位。']
    ]
  },
  {
    id:'09_hiv_testing', name:'HIV 检测与误区识别机', en:'HIV Testing & Myth Detection', room:'检测与日常生活', time:14.25, frame:'显示核酸检测的典型窗口',
    question:'两类 HIV 检测的窗口期有何区别？哪些日常接触不会传播 HIV？', titleId:'lessonTitle',
    idle:'比较两种检测的典型窗口，再转动滚筒检视四个日常场景。',
    big:'不同 HIV 检测有不同的窗口期；日常社交接触不会传播 HIV。',
    steps:[
      ['Meet the two detectors','装入教学样本','两种检测寻找不同的 HIV 标志物。观察窗内是教学符号，不提供检测结果。'],
      ['Venous antigen/antibody test','读取静脉血抗原／抗体窗口','使用静脉血的实验室抗原／抗体检测，通常可在暴露后 18–45 天检出 HIV。指尖采血的快速检测窗口不同。'],
      ['Nucleic acid test (NAT)','比较核酸检测窗口','未使用抗逆转录病毒药物时，核酸检测（NAT）通常可在暴露后 10–33 天检出 HIV。PrEP 和 PEP 等药物可能影响检测时机。'],
      ['An early negative needs follow-up','查看过早检测的阴性结果','窗口期内的阴性结果不能排除近期感染。请咨询检测机构或医务人员，按建议安排复查。'],
      ['Check four common myths','转动误区滚筒','握手、拥抱、共餐和蚊虫叮咬都不会传播 HIV。'],
      ['Return to standby','复位检测机','检测样本托盘和场景滚筒回到起点。']
    ]
  }
];
