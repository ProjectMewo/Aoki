import { Mappool } from '@local-types/settings';
import type English from './en-US';
import { CommandContext, GuildRole } from 'seyfert';

export default {
  // ############### Commands
  anime: {
    scheduleSub: {
      name: 'lịch-trình',
      description: 'quản lý lịch trình anime của cậu',
      add: {
        name: 'thêm',
        description: 'thêm một lịch trình theo dõi anime',
        checkDm: 'Tớ chỉ đang kiểm tra xem tớ có thể nhắn tin cho cậu không thôi. Đừng quan tâm đến tớ ở đây nha, cảm ơn.',
        cannotDm: 'Đồ ngốc, tớ không thể nhắn tin trực tiếp cho cậu. Bật nó lên đi, vì khi tớ thông báo, tớ sẽ thông báo ở đó.',
        moreThanOne: 'Đồ ngốc, cậu chỉ có thể có **một lịch trình** chạy cùng lúc thôi.\n\nSensei của tớ có thể sẽ bỏ giới hạn này trong tương lai.',
        notFound: 'O-oh, hình như tớ không tìm thấy gì trong hồ sơ.\n\nCậu nghĩ nó tồn tại? Sensei của tớ chắc làm gì đó sai rồi. Thử báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.',
        notAiring: 'Đồ ngốc, bộ này không phải là bộ đang phát sóng. Nó cũng không phải là bộ sắp công chiếu. Có thể đã kết thúc rồi đấy chứ, mà tớ không kiểm tra đâu.',
        tracking: (title: string, time: number) => `Xong rồi. Đang theo dõi các tập phát sóng của **${title}**. Tập tiếp theo sẽ phát sóng trong khoảng **${time}** giờ.`,
        apiError: 'O-oh, có gì đó không ổn khi tớ cố lưu nó cho cậu.\n\nSensei của tớ chắc làm gì đó sai rồi. Thử báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.'
      },
      current: {
        name: 'hiện-tại',
        description: 'xem lịch trình anime hiện tại',
        noSub: 'Đồ ngốc, cậu không đăng ký theo dõi bộ anime nào cả.',
        notFound: 'O-oh, bộ này đã biến mất khỏi AniList vì một lý do kỳ lạ nào đó.\n\nCậu nghĩ nó tồn tại? Sensei của tớ chắc làm gì đó sai rồi. Thử báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.',
        response: (title: string, episode: string, time: number | string) => `Đây. Cậu đang xem **${title}**. Tập tiếp theo (tập **${episode}**) sẽ phát sóng trong khoảng **${time}** giờ.`,
        apiError: 'O-oh, có gì đó không ổn khi tớ cố tra cứu cho cậu.\n\nSensei của tớ chắc làm gì đó sai rồi. Thử báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.'
      },
      remove: {
        name: 'xóa',
        description: 'xóa một lịch trình theo dõi anime',
        noSub: 'Đồ ngốc, cậu không đăng ký theo dõi bộ anime nào cả.',
        notFound: 'O-oh, bộ này đã biến mất khỏi AniList vì một lý do nào đó.\n\nCậu nghĩ nó tồn tại? Sensei của tớ chắc làm gì đó sai rồi. Thử báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.',
        response: (title: string) => `Được rồi. Tớ sẽ ngừng nhắc cậu về **${title}** để cậu ngủ ngon vào ban đêm.`,
        apiError: 'O-oh, có gì đó không ổn khi tớ cố tra cứu cho cậu.\n\nSensei của tớ chắc làm gì đó sai rồi. Thử báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.'
      }
    },
    action: {
      name: 'hành-động',
      description: 'thực hiện một hành động liên quan đến anime',
      choices: [
        { name: "waifu", value: "waifu" }, { name: "neko", value: "neko" },
        { name: "shinobu", value: "shinobu" }, { name: "megumin", value: "megumin" },
        { name: "bắt nạt", value: "bully" }, { name: "ôm", value: "cuddle" },
        { name: "khóc", value: "cry" }, { name: "ôm chặt", value: "hug" },
        { name: "awoo", value: "awoo" }, { name: "hôn", value: "kiss" },
        { name: "liếm", value: "lick" }, { name: "vỗ đầu", value: "pat" },
        { name: "cười tự mãn", value: "smug" }, { name: "gõ đầu", value: "bonk" },
        { name: "ném", value: "yeet" }, { name: "đỏ mặt", value: "blush" },
        { name: "cười", value: "smile" }, { name: "vẫy tay", value: "wave" },
        { name: "đập tay", value: "highfive" }, { name: "nắm tay", value: "handhold" },
        { name: "ăn", value: "nom" }, { name: "cắn", value: "bite" },
        { name: "nhảy bổ vào", value: "glomp" }, { name: "tát", value: "slap" },
        { name: "đá", value: "kick" }
      ],
      fail: 'O-oh, có gì đó không ổn. Dịch vụ có thể đang ngừng hoạt động, chờ một chút nhé?\n\nBáo với sensei của tớ nếu nó kéo dài quá lâu bằng lệnh `/hỏi-tớ-về lỗi-của-tớ`.',
      desc: 'Đây. Không phải tớ muốn tra cứu đâu!',
      apiError: 'O-oh, có gì đó không ổn khi tớ cố tra cứu cho cậu.\n\nSensei của tớ chắc làm gì đó sai rồi. Thử báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.'
    },
    airing: {
      name: 'phát-sóng',
      description: 'xem thông tin phát sóng anime (kết quả bằng tiếng Anh)',
      choices: [
        { name: 'Chủ Nhật', value: 'sunday' },
        { name: 'Thứ 2', value: 'monday' },
        { name: 'Thứ 3', value: 'tuesday' },
        { name: 'Thứ 4', value: 'wednesday' },
        { name: 'Thứ 5', value: 'thursday' },
        { name: 'Thứ 6', value: 'friday' },
        { name: 'Thứ 7', value: 'saturday' }
      ],
      apiError: 'Oh. Dịch vụ có thể đã chết. Chờ một chút, rồi thử lại nha?\n\nBáo với sensei của tớ nếu nó kéo dài quá lâu bằng lệnh `/hỏi-tớ-về lỗi-của-tớ`.',
      notFound: 'O-oh, hình như tớ không tìm thấy gì trong hồ sơ.\n\nCậu nghĩ nó tồn tại? Sensei của tớ chắc làm gì đó sai rồi. Thử báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.',
      undocErr: 'Trời, lỗi này chưa từng được ghi nhận. Chờ khoảng 5-10 phút nha, rồi thử lại.\n\nNếu không có gì thay đổi sau đó, sensei của tớ chắc làm gì đó sai rồi. Thử báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.'
    },
    gelbooru: {
      name: 'tìm-gelbooru',
      description: 'tìm kiếm hình ảnh trên gelbooru',
      noSfw: 'Đồ ngốc, cậu biết trang web này có gì mà. Chỉ có thể dùng trong kênh NSFW thôi.',
      apiError: 'O-oh, có gì đó không ổn. Dịch vụ có thể đã chết. Chờ một chút, rồi thử lại.\n\nNếu không có gì thay đổi sau đó, sensei của tớ chắc làm gì đó sai rồi. Thử báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.',
      notFound: 'Không tìm thấy bài đăng nào với các thẻ đó. Thử các thẻ khác, và nhớ tách các thẻ bằng dấu cách.',
      search: 'Kết quả tìm kiếm trên Gelbooru',
      score: 'Điểm',
      rating: 'Xếp hạng',
      tags: 'Thẻ',
      page: 'Trang'
    },
    profile: {
      name: 'hồ-sơ',
      description: 'xem hồ sơ anime của cậu (kết quả bằng tiếng Anh)',
      noNsfw: 'Đừng lén lút tìm nội dung xấu nữa, đồ ngốc. Văn minh lên đi chứ.',
      notFound: 'O-oh, hình như tớ không tìm thấy gì trong hồ sơ.\n\nCậu nghĩ nó tồn tại? Sensei của tớ chắc làm gì đó sai rồi. Thử báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.',
      apiError: 'O-oh, có gì đó không ổn. Dịch vụ có thể đã chết. Chờ một chút, rồi thử lại.\n\nNếu không có gì thay đổi sau đó, sensei của tớ chắc làm gì đó sai rồi. Thử báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.',
      undocErr: 'Trời, lỗi này chưa từng được ghi nhận. Chờ khoảng 5-10 phút nha, rồi thử lại.\n\nNếu không có gì thay đổi sau đó, sensei của tớ chắc làm gì đó sai rồi. Thử báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.'
    },
    quote: {
      name: 'trích-dẫn',
      description: 'lấy một trích dẫn từ anime (kết quả bằng tiếng Anh)',
      apiError: 'Các nhân vật từ chối nói chuyện với tớ mất rồi, buồn ghê. Có lẽ thử lại sau vài phút nha?\n\nNếu không có gì thay đổi sau đó, sensei của tớ chắc làm gì đó sai rồi. Thử báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.'
    },
    random: {
      name: 'ngẫu-nhiên',
      description: 'lấy một anime ngẫu nhiên (kết quả bằng tiếng Anh)',
      notFound: 'O-oh, hình như tớ không tìm thấy gì trong hồ sơ.\n\nCậu nghĩ nó tồn tại? Sensei của tớ chắc làm gì đó sai rồi. Thử báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.',
      apiError: 'O-oh, có gì đó không ổn. Dịch vụ có thể đã chết. Chờ một chút, rồi thử lại.\n\nNếu không có gì thay đổi sau đó, sensei của tớ chắc làm gì đó sai rồi. Thử báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.',
      undocErr: 'Trời, lỗi này chưa từng được ghi nhận. Chờ khoảng 5-10 phút nha.\n\nNếu không có gì thay đổi sau đó, sensei của tớ chắc làm gì đó sai rồi. Thử báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.'
    },
    search: {
      name: 'tìm-kiếm',
      description: 'tìm kiếm thông tin anime (kết quả bằng tiếng Anh)',
      noNsfw: 'Oh. Những gì tớ tìm thấy là nội dung R-17+, mà tớ không thể hiển thị ở đây. Vào kênh NSFW, rồi quay lại với tớ.',
      notFound: 'O-oh, hình như tớ không tìm thấy gì trong hồ sơ.\n\nCậu nghĩ nó tồn tại? Sensei của tớ chắc làm gì đó sai rồi. Thử báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.',
      apiError: 'O-oh, có gì đó không ổn. Dịch vụ có thể đã chết. Chờ một chút, rồi thử lại.\n\nNếu không có gì thay đổi sau đó, sensei của tớ chắc làm gì đó sai rồi. Thử báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.',
      undocErr: 'Trời, lỗi này chưa từng được ghi nhận. Chờ khoảng 5-10 phút nha.\n\nNếu không có gì thay đổi sau đó, sensei của tớ chắc làm gì đó sai rồi. Thử báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.'
    },
  },
  fun: {
    name: 'giải-trí',
    description: 'vài câu lệnh cho vui',
    "8ball": {
      name: 'bi-số-8',
      description: 'hỏi bi số 8 một câu hỏi',
      noNsfw: 'Đồ ngốc, đừng chửi thề. Văn minh lên đi chứ.'
    },
    advice: {
      name: 'lời-khuyên',
      description: 'nhận một lời khuyên ngẫu nhiên',
      apiError: 'Tớ hơi bận một chút, thử lại sau nha?.\n\nSensei của tớ chắc đã làm gì đó sai nếu tớ từ chối trả lời lần nữa. Thử báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.'
    },
    affirmation: {
      name: 'khẳng-định',
      description: 'nhận một câu khẳng định tích cực',
      apiError: 'Tớ hơi bận, không tích cực nổi. Thử lại sau một chút nha.\n\nSensei của tớ chắc đã làm gì đó sai nếu tớ từ chối trả lời lần nữa. Thử báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.'
    },
    fact: {
      name: 'sự-thật',
      description: 'nhận một sự thật thú vị',
      apiError: 'Có một sự thật không thú vị tý nào là bây giờ tớ hơi bận. Thử lại sau một chút nha?\n\nSensei của tớ chắc làm sai nếu tớ từ chối trả lời lần nữa. Thử báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.'
    },
    fortune: {
      name: 'may-mắn',
      description: 'nhận một dự đoán may mắn',
      apiError: 'Bánh quy may mắn? Tớ hết rồi, tớ sẽ đi lấy mấy cái sau một lát nữa, tớ hơi bận. Thử lại sau một chút nha.\n\nSensei của tớ chắc đã làm gì đó sai nếu tớ từ chối trả lời lần nữa. Thử báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.'
    },
    generator: {
      name: 'tạo-meme',
      description: 'tạo một nội dung ngẫu nhiên',
      apiError: 'Bộ xử lý hình ảnh của tớ đang được sửa chữa, chờ một chút nha.\n\nSensei của tớ chắc làm gì đó sai rồi, tớ không thể tự sửa nó đâu! Thử báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.',
      desc: 'Đây cậu. Không phải tớ muốn dành thời gian làm điều này đâu!',
      footer: (author: string) => `Được yêu cầu bởi ${author}`
    },
    owo: {
      name: 'owo',
      description: 'chuyển đổi văn bản sang phong cách owo',
      apiError: 'OwO, cái gì đây?! Lỗi phần mềm hoang dã nữa?!\n\nSensei của tớ chắc làm gì đó sai rồi đó, tớ không thể tự xử lý nó đâu! Thử báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.'
    },
    ship: {
      name: 'ghép-đôi',
      description: 'tính toán tỷ lệ ghép đôi giữa hai người',
      response: (rate: number) => {
        if (rate === 0) {
          return `Wow, ấn tượng ghê. Tớ chưa từng thấy điều này xảy ra trước đây.\n\n||Đó là tỷ lệ ghép đôi **0%**, coi như là hai cậu may mắn đi.||`;
        } else if (rate <= 30) {
          return `Hai cậu không có cơ hội đâu. Tớ không thích **${rate}%**, và có lẽ cậu cũng vậy.`;
        } else if (rate <= 50) {
          return `Cũng được, tớ nghĩ hai cậu cần thêm thời gian. Hai cậu đạt **${rate}%**, không phải tớ thích tỷ lệ này hay gì đâu.`;
        } else if (rate <= 70) {
          return `Được rồi, ổn đấy. Hai cậu đạt **${rate}%**, tớ nghĩ tớ thích điều đó.`;
        } else if (rate <= 99) {
          return `Ê nha! Tốt đấy, tớ hiếm khi thấy một cặp đôi đạt điểm cao như vậy. Một con số **${rate}%** đáng kinh ngạc!`;
        } else if (rate === 100) {
          return `Trời ơi. Cặp đôi hoàn hảo đây rồi đúng không? Tỷ lệ ghép đôi **100%**!`;
        }
      },
      luckyWheel: {
        start: "Vòng quay may mắn! Xem hai cậu có may mắn không nào!",
        success: "Hey, cặp đôi tốt đấy! Hai cậu quay được **100%**!",
        failure: "Đồ ngốc, hai cậu quay vào **0%** mất rồi."
      },
      selfShip: "Pfft. Không ai làm điều đó đâu, đồ ngốc.",
      botShip: "Ew, tớ không phải fan của việc ghép đôi. Chọn ai khác đi!"
    },
    today: {
      name: 'hôm-nay',
      description: 'xem sự kiện lịch sử xảy ra hôm nay',
      apiError: 'O-oh, nhà sử học vừa đi nghỉ một chút. Thử lại sau một chút, được không?\n\nNếu ông ấy đi quá lâu, báo với sensei của tớ nha! Thử báo cáo điều đó bằng `/hỏi-tớ-về lỗi-của-tớ` đi.'
    },
    truth: {
      name: 'câu-hỏi-sự-thật',
      description: 'nhận một câu hỏi sự thật',
      apiError: 'Câu hỏi này làm tớ run quá không thể nói ra! Có lẽ thử lại sau lát nữa được không? Sensei của tớ chắc làm gì đó sai rồi.\n\nThử báo cáo điều đó bằng `/hỏi-tớ-về lỗi-của-tớ` nếu đúng là như vậy!'
    }
  },
  my: {
    name: 'hỏi-tớ-về',
    description: 'mấy câu lệnh về quá trình hoạt động của tớ',
    ping: {
      name: 'ping',
      description: 'thời gian tớ cần để thấy tin nhắn của cậu',
      responses: [
        "Argh, lại nữa à? Lúc nào cũng muốn làm phiền tớ. Tớ đã trả lời trong **{{ms}}ms**.",
        "Đồ ngốc, tớ đã trả lời trong **{{ms}}ms**.",
        "Đây này, tớ đã trả lời trong **{{ms}}ms**. Chẳng phải tớ muốn lãng phí thời gian của mình đâu.",
        "Đây này, không phải là nó đáng thời gian của tớ. Chỉ mất **{{ms}}ms** thôi.",
        "Thế này đúng chưa? Tớ đã trả lời trong **{{ms}}ms**.",
        "**{{user}}**? Tớ đã trả lời trong **{{ms}}ms**.",
        "**{{user}}**! Cậu đã lãng phí **{{ms}}ms** thời gian của tớ rồi, HỪM.",
        "Tớ làm đúng chưa? Tớ đã trả lời trong **{{ms}}ms**.",
        "**{{user}}**, vâng tớ đây, và tớ mất **{{ms}}ms** để trả lời.",
        "**{{user}}**, sao lại ping tớ? Cậu đã lãng phí **{{ms}}ms** thời gian của tớ rồi.",
        "Này **{{user}}**, tớ mất **{{ms}}ms** để gửi tin nhắn này",
        "Cậu đã làm tớ già thêm **{{ms}}ms** - chỉ vì hỏi đấy.",
        "**{{user}}**, tớ đã thấy tin nhắn của cậu và tớ mất **{{ms}}ms** để không thèm quan tâm.",
        "Cậu có biết tớ mất bao lâu để đọc tin nhắn đó không? Cậu gần như đã lãng phí **{{ms}}ms** trong ngày của tớ rồi đấy!",
        "Tớ đã trả lời trong **{{ms}}ms**, cậu vui chưa?"
      ]
    },
    language: {
      name: "ngôn-ngữ",
      description: "thay đổi ngôn ngữ của tớ",
      choices: [
        { name: 'Tiếng Anh', value: 'en-US' },
        { name: 'Tiếng Việt', value: 'vi' }
      ],
      response: `Được rồi, tớ sẽ nói chuyện với cậu bằng **tiếng Việt**!`
    },
    fault: {
      name: "lỗi-của-tớ",
      description: "báo cáo lỗi hoặc vấn đề với tớ",
      noInput: "Đồ ngốc, đưa tớ một tin nhắn lỗi, một hình ảnh, hay gì đó đi chứ. Không có gì sao tớ gửi được.",
      gibberishDetected: "Tớ thấy cậu đang gõ linh tinh kìa, đồ ngốc.",
      gibberishWarning1: "Đừng gửi mấy thứ [này](https://i.imgur.com/C5tvxfp.png) qua tớ, làm ơn.",
      gibberishWarning2: "Tớ thích mấy thứ [này](https://i.imgur.com/FRWBFXr.png) hơn.",
      thankYouFeedback: "Cảm ơn cậu đã phản hồi. Ghi chú sẽ được giải quyết sau vài ngày làm việc.\n\nBật tin nhắn trực tiếp của cậu lên nhé! Sensei của tớ có thể sẽ liên hệ trực tiếp với cậu!",
      nonImageAttachment: "Cảm ơn cậu đã gửi tệp đính kèm, nhưng hiện tại tớ chỉ hỗ trợ hình ảnh thôi."
    },
    info: {
      name: "thông-tin",
      description: "cung cấp thông tin về tớ",
      desc: [
        "Oh, là cậu à? Hey, tớ là **Aoki**. Tên tớ chỉ có nghĩa là một cái cây xanh",
      ].join(""),
      fieldOne: {
        name: 'Cậu có thể làm gì?',
        value: "Có lẽ là cung cấp thông tin anime nâng cao và một số tiện ích nhỏ để cậu không phải mở trình duyệt."
      },
      fieldTwo: {
        name: "Sao không có lệnh trợ giúp?",
        value: "Tớ đã viết mô tả cho chúng rồi, chúng là lệnh bắt đầu bằng dấu `/`, và Discord có gán mô tả cho chúng đó! Chỉ cần làm theo để có thứ cậu muốn, *thở dài*. Tớ bận lắm, không có thời gian viết mấy thứ đó đâu."
      },
      fieldThree: {
        name: "Làm sao để đưa cậu vào server của tớ?",
        value: "Oh, cậu muốn tớ vào server của cậu à? Tuyệt. [Nhấn vào đây để đưa tớ vào.](https://discord.com/oauth2/authorize?client_id=898267773755947018&permissions=8&scope=applications.commands%20tớ)\nTớ khá háo hức để xem máy chủ của cậu có gì đó."
      },
      madeWLove: 'Làm bằng ❤'
    },
    invite: {
      name: "lời-mời",
      description: "mời tớ vào server của cậu",
      desc: [
        "Hey, cậu muốn đưa tớ vào server của cậu à? Tuyệt. Hãy làm cho server của cậu sôi động hơn một chút.\n",
        `[Nhấn vào đây để đưa tớ vào.](https://discord.com/oauth2/authorize?client_id=898267773755947018)`,
        "Tớ khá háo hức để xem máy chủ của cậu có gì đó."
      ].join("\n"),
      title: 'Mời tớ hả?',
      madeWLove: 'Làm bằng ❤'
    },
    rights: {
      name: "quyền",
      description: "quản lý quyền của tớ",
      choices: [
        { name: 'đọc & xử lý tin nhắn của cậu', value: 'processMessagePermission' },
        { name: 'lưu thông tin hồ sơ osu! của cậu khi xác minh', value: 'saveOsuUserAccount' }
      ],
      isCurrent: (bool: boolean, key: string) => `Ừ, tớ ${bool ? "có thể" : "không thể"} ${key} vì cậu đã ${bool ? "bật" : "tắt"} nó trước đó rồi.`,
      readProcess: 'đọc & xử lý tin nhắn của cậu',
      saveOsu: 'lưu thông tin hồ sơ osu! của cậu khi xác minh',
      set: (value: boolean, key: string) => `Được rồi, tớ **${value ? 'sẽ' : 'sẽ không'}** ${key}.`,
      apiError: 'O-oh, có gì đó không ổn. Cơ sở dữ liệu của tớ có thể đã chết. Chờ một chút, rồi thử lại nha?\n\nNếu không có gì thay đổi sau đó, sensei của tớ chắc làm gì đó sai rồi. Thử báo cáo điều này bằng `/hỏi-tớ-về lỗi-của-tớ` đi.'
    },
    stats: {
      name: "thống-kê",
      description: "xem thống kê của tớ",
      author: 'Thống kê thô',
      footer: 'Có lẽ là một kẻ ngốc',
      system: 'Hệ thống',
      app: 'Ứng dụng',
      systemField: {
        ram: 'RAM',
        free: 'Trống',
        totalUsed: 'Tổng đã dùng',
        procLoad: 'Tớ dùng',
        cpuLoad: 'Tải CPU',
        sysUp: 'Hoạt động'
      },
      appField: {
        cliVer: 'Phiên bản',
        cliUp: 'Tớ online được',
        cmdCount: 'Lệnh',
        srvCount: 'Server',
        usrCount: 'Người dùng',
        usrOnSrvRatio: 'TB. Người/Server'
      },
      desc: {
        linKern: 'Linux phiên bản',
        nodeVer: 'Trình biên dịch Node bản',
        seyfertVer: 'Seyfert',
        cpuType: 'CPU',
        unknownClockSpeed: 'Không rõ'
      }
    },
    vote: {
      name: "bỏ-phiếu",
      description: "bỏ phiếu cho tớ để nhận đặc quyền",
      replies: ["Bỏ phiếu? Được rồi.", "Cuối cùng cậu cũng xuất hiện?", "Oh, chào. Tớ hơi bận, nên làm nhanh đi.", "Không phải tớ không bận, nhưng được thôi."],
      doThatHere: 'Bình chọn cho tớ ở đây.',
      thanks: 'Nếu cậu quyết định bỏ phiếu, cảm ơn cậu. Sensei của tớ nói rằng cậu sẽ nhận được đặc quyền bổ sung trong tương lai!'
    }
  },
  osu: {
    genericRoundChoices: [
      { name: 'Vòng loại', value: 'Qualifiers' },
      { name: 'Vòng bảng', value: 'Group Stage' },
      { name: 'Vòng 32 đội', value: 'Round of 32' },
      { name: 'Vòng 16 đội', value: 'Round of 16' },
      { name: 'Tứ kết', value: 'Quarterfinals' },
      { name: 'Bán kết', value: 'Semifinals' },
      { name: 'Chung kết', value: 'Finals' },
      { name: 'Chung kết tổng', value: 'Grand Finals' }
    ],
    mappool: {
      name: 'mappool',
      description: 'quản lý mappool của giải đấu.',
      approve: {
        name: 'phê-duyệt',
        description: 'phê duyệt map cho mappool của giải đấu',
        noTournament: 'Đồ ngốc, không có giải đấu nào tồn tại trong máy chủ này. Hãy tạo một cái bằng `/tourney make` trước.',
        noPermission: 'Hey! Cậu không có quyền thêm map vào mappool đâu, đồ ngốc. Chỉ host, cố vấn và người làm mappool mới được làm điều này.',
        noActiveRound: 'Oh. Không có vòng nào đang hoạt động cho giải đấu này. Nhắc người tổ chức đặt vòng hiện tại bằng `/tourney current` trước.',
        noMappool: (currentRound: string) => `Không tìm thấy mappool nào cho **${currentRound}**. Tạo nó trước bằng \`/tourney add-round\`.`,
        invalidSlot: (slot: string, availableSlots: string[], currentRound: string) => `Đồ ngốc, slot "${slot}" không tồn tại trong mappool của ${currentRound}.\n\nĐây là các slot có sẵn: ${availableSlots.join(', ')}`,
        invalidUrl: 'Đồ ngốc, đó không phải là URL beatmap hợp lệ. Cung cấp URL đầy đủ (vd: <https://osu.ppy.sh/beatmapsets/1234#osu/5678>) hoặc URL rút gọn (vd: <https://osu.ppy.sh/b/5678>).',
        fetchError: 'O-oh, có gì đó không ổn. Cơ sở dữ liệu của tớ có thể đã chết. Chờ một chút, rồi thử lại nha?\n\nNếu không có gì thay đổi, sensei của tớ chắc làm gì đó sai rồi. Thử báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` nha.',
        mapUpdated: (title: string, url: string, slot: string, currentRound: string) => `Xong rồi. Đã cập nhật [${title}](${url}) cho **${slot}** trong mappool của ${currentRound}.`,
        mapAdded: (title: string, url: string, slot: string, currentRound: string) => `Xong rồi. Đã thêm [${title}](${url}) cho **${slot}** vào mappool của ${currentRound}.`
      },
      replays: {
        name: 'xem-replay',
        description: 'xem replay của mappool trong giải đấu',
        noTournament: 'Đồ ngốc, không có giải đấu nào tồn tại trong máy chủ này. Tạo một cái bằng `/tourney make` trước đi.',
        noPermission: 'Hey! Cậu không có quyền xem file replay của mappool này đâu, đồ ngốc. Chỉ tổ chức, cố vấn và người test/replay mới được truy cập lệnh này.',
        noActiveRound: 'Oh. Không có vòng nào đang hoạt động, và cũng không có vòng nào được chỉ định. Nhắc người tổ chức thiết lập vòng hiện tại bằng `/tourney current`.',
        noMappool: (selectedRound: string) => `Không tìm thấy định dạng mappool cho **${selectedRound}**. Nhắc người tổ chức (host) thiết lập mappool hiện tại cho vòng này bằng \`/tourney add-round\`.`,
        noReplays: (selectedRound: string) => `Oh. Không có replay nào được lưu cho **${selectedRound}**.`,
        response: (selectedRound: string, replays: { slot: string; messageUrl: string; replayer: string }[]) =>
          `**Replay cho ${selectedRound}:**\n` +
          replays.map(replay => `- [Replay cho ${replay.slot}](${replay.messageUrl}) bởi **${replay.replayer}**`).join('\n')
      },
      suggest: {
        name: 'đề-xuất',
        description: 'đề xuất map cho mappool của giải đấu',
        noTournament: 'Đồ ngốc, không có giải đấu nào tồn tại trong server này. Tạo một cái bằng `/tourney make` trước đi.',
        noPermission: 'Hey! Cậu không có quyền đề xuất map cho mappool đâu, đồ ngốc. Chỉ tổ chức, cố vấn, người làm mappool và người test/replay mới được đề xuất map.',
        noActiveRound: 'Oh. Không có vòng nào đang hoạt động cho giải đấu này. Nhắc người tổ chức đặt vòng hiện tại bằng `/tourney current` trước.',
        noMappool: (currentRound: string) => `Không tìm thấy định dạng mappool cho **${currentRound}**. Nhắc người tổ chức cung cấp tất cả các slot của mappool này!`,
        invalidSlot: (slot: string, availableSlots: string[], currentRound: string) => `Slot **${slot}** không tồn tại trong mappool của **${currentRound}**. Các slot có sẵn: ${availableSlots.join(', ')}`,
        invalidUrl: 'Đồ ngốc, đó không phải là URL beatmap hợp lệ. Cung cấp URL đầy đủ (vd: <https://osu.ppy.sh/beatmapsets/1234#osu/5678>) hoặc URL rút gọn (vd: <https://osu.ppy.sh/b/5678>).',
        alreadySuggested: (slot: string) => `Hey! Map này đã được đề xuất cho slot ${slot}, đồ ngốc.`,
        suggestionAdded: (slot: string, currentRound: string) => `Xong rồi. Đã thêm đề xuất của cậu cho **${slot}** trong mappool của **${currentRound}**.`,
        confirmPrompt: 'Hay, troll được đấy, đồ ngốc.\n\nHay là cậu đang nghiêm túc? Hãy hỏi người tổ chức, hoặc chỉ cần hỏi tớ vòng hiện tại là gì bằng `/tourney current`.'
      },
      viewSuggestions: {
        name: 'xem-đề-xuất',
        description: 'xem các đề xuất map cho mappool của giải đấu',
        noTournament: 'Đồ ngốc, không có giải đấu nào tồn tại trong máy chủ này. Tạo một cái bằng `/tourney make` trước đi.',
        noPermission: 'Hey! Cậu không có quyền xem đề xuất map đâu, đồ ngốc. Chỉ tổ chức, cố vấn, người làm mappool và người test/replay mới được truy cập lệnh này.',
        noActiveRound: 'Oh. Không có vòng nào đang hoạt động cho giải đấu này. Nhắc người tổ chức đặt vòng hiện tại bằng `/tourney current` trước nha.',
        noMappool: (currentRound: string) => `Không tìm thấy định dạng mappool cho **${currentRound}**. Nhắc người tổ chức thiết lập các slot mappool nha!`,
        noSuggestions: (currentRound: string) => `Oh. Chưa có đề xuất nào được thực hiện cho mappool của **${currentRound}**.`,
        failedToLoad: (url: string) => `- [Không tải được] (${url})`,
        suggestionTitle: (currentRound: string) => `Đề xuất - ${currentRound}`,
        suggestionDescription: (slot: string, mapsText: string) => `Slot: **${slot}**\nMap:\n${mapsText}`
      },
      view: {
        name: 'xem-mappool',
        description: 'xem mappool của giải đấu',
        noTournament: 'Đồ ngốc, không có giải đấu nào tồn tại trong máy chủ này. Tạo một cái bằng `/tourney make` trước đi.',
        noPermission: 'Hey! Cậu không có quyền xem mappool đâu. Chỉ host, cố vấn, người làm mappool và người test/replay mới được truy cập lệnh này.',
        noActiveRound: 'Oh. Không có vòng nào đang hoạt động cho giải đấu này. Nhắc người tổ chức đặt vòng hiện tại bằng `/tourney current` trước nha.',
        noMappool: (currentRound: string) => `Không tìm thấy định dạng mappool cho **${currentRound}**. Nhắc người tổ chức thiết lập mappool nha!`,
        noMaps: (currentRound: string) => `Oh. Chưa có map nào được xác nhận cho mappool của ${currentRound}.`,
        mapUnavailable: (slot: string, url: string) => `**${slot}**: [Thông tin map không khả dụng] (URL map: ${url})`,
        mapError: (slot: string, url: string) => `**${slot}**: [Lỗi khi lấy thông tin map] (URL map: ${url})`,
        mapDetails: (slot: string, artist: string, title: string, version: string, url: string, od: string, hp: string, star: string) =>
          `**${slot}**: [${artist} - ${title} [${version}]](${url}) - \`OD: ${od}, HP: ${hp}, SR: ${star}\``,
        embedTitle: (currentRound: string) => `Lựa chọn cuối cùng cho ${currentRound}`
      }
    },
    tourney: {
      name: 'giải-đấu',
      description: 'quản lý giải đấu',
      addRole: {
        name: 'thêm-vai-trò',
        description: 'thêm vai trò vào roleset của giải đấu',
        choices: [
          { name: 'Host', value: 'host' },
          { name: 'Cố vấn', value: 'advisor' },
          { name: 'Người làm mappool', value: 'mappooler' },
          { name: 'Người thử/tạo replay', value: 'testReplayer' },
          { name: 'Người làm map', value: 'customMapper' }
        ],
        noTournament: 'Đồ ngốc, không có giải đấu nào tồn tại trong máy chủ này. Tạo một cái bằng `/tourney make` trước đi.',
        noPermission: 'Hey! Cậu không có quyền thêm vai trò vào roleset đâu, đồ ngốc. Chỉ host mới được làm điều này.',
        roleAlreadyAdded: (roleId: string, roleset: string) => `Đồ ngốc, <@&${roleId}> đã là một phần của roleset **${roleset}** rồi.`,
        roleAdded: (roleId: string, roleset: string) => `Xong rồi. Đã thêm <@&${roleId}> vào roleset **${roleset}**.`
      },
      addRound: {
        name: 'thêm-vòng',
        description: 'thêm vòng đấu mới cho giải đấu',
        noTournament: 'Đồ ngốc, không có giải đấu nào tồn tại trong máy chủ này. Tạo một cái bằng `/tourney make` trước.',
        profane: 'Này, đặt tên vòng thì đặt cho thân thiện chứ. Làm vậy không được đâu.',
        noPermission: 'Hey! Cậu không có quyền thêm vòng đấu cho giải đấu đâu, đồ ngốc. Chỉ host, cố vấn và người làm mappool mới được làm điều này.',
        noSlots: 'Đồ ngốc. Cậu phải cung cấp ít nhất một slot mappool.',
        roundExists: (round: string) => `Oh. Một mappool cho ${round} đã tồn tại. Sử dụng \`/mappool add\` để thêm map vào đó.`,
        success: (round: string, slots: string[], setCurrent: boolean) =>
          `Xong rồi. Đã thêm ${round} với ${slots.length} slot: ${slots.join(', ')}.\n` +
          (setCurrent ? `Đây hiện là vòng đấu hiện tại.` : `Sử dụng \`/tourney current ${round}\` để đặt đây là vòng hiện tại.`)
      },
      current: {
        name: 'vòng-hiện-tại',
        description: 'xem hoặc đặt vòng hiện tại của giải đấu',
        noTournament: 'Đồ ngốc, không có giải đấu nào tồn tại trong server này. Tạo một cái bằng `/tourney make` trước.',
        noActiveRound: (name: string, abbreviation: string) =>
          `**${name}** (${abbreviation}) chưa có vòng hiện tại được đặt.\n\nSử dụng \`/tourney current [round]\` để đặt một vòng.`,
        slotInfo: (currentMappool: Mappool | undefined) => currentMappool && currentMappool.slots.length > 0
          ? `Các slot được công bố: ${currentMappool.slots.join(', ')}`
          : 'Chưa có slot nào được công bố cho vòng này.',
        currentRoundInfo: (name: string, abbreviation: string, currentRound: string, slotInfo: string) =>
          `**${name}** (${abbreviation}) hiện đang ở giai đoạn **${currentRound}**.\n\n${slotInfo}`,
        noPermission: 'Hey! Cậu không có quyền thay đổi vòng hiện tại đâu, đồ ngốc. Chỉ host và cố vấn mới được làm điều này.',
        roundNotFound: (round: string) =>
          `Vòng "${round}" không tồn tại trong giải đấu này. Thêm nó trước bằng \`/tourney add-round\`.`,
        roundSetSuccess: (name: string, round: string, slots: string[]) =>
          `Xong rồi. Vòng hiện tại của **${name}** bây giờ là **${round}**.\n\nCác slot có sẵn: ${slots.join(', ')}`
      },
      delete: {
        name: 'xóa',
        description: 'xóa giải đấu hiện tại',
        noTournament: 'Đồ ngốc, không có giải đấu nào tồn tại trong máy chủ này. Tạo một cái bằng `/tourney make` trước.',
        noPermission: 'Hey! Cậu không có quyền xóa giải đấu này đâu, đồ ngốc. Chỉ host mới được làm điều này.',
        confirmPrompt: (name: string, abbreviation: string) =>
          `Cậu chắc chắn muốn xóa giải đấu **${name}** (${abbreviation}) chứ? Hành động này không thể hoàn tác!`,
        verySure: 'Tớ chắc 100%!',
        success: (name: string, abbreviation: string) =>
          `Xong rồi. Đã xóa giải đấu **${name}** (${abbreviation}).`
      },
      make: {
        name: 'tạo',
        description: 'tạo giải đấu mới trong máy chủ',
        noPermission: 'Hey! Cậu không có quyền tạo giải đấu đâu, đồ ngốc. Chỉ quản trị viên máy chủ mới được làm điều này.',
        alreadyExists: (name: string, abbreviation: string) =>
          `Một giải đấu đã tồn tại trong máy chủ này: **${name}** (${abbreviation}). Cần phải xóa nó trước khi tạo giải đấu mới.`,
        success: (name: string, abbreviation: string, roles: (GuildRole | undefined)[]) =>
          `Xong rồi. Đã tạo giải đấu **${name}** (${abbreviation})!\n\n` +
          `Vai trò được gán:\n` +
          roles.map(role => role?.id ? `- <@&${role.id}>` : "").join('\n') +
          `\nSử dụng \`/tourney add-round\` để thiết lập vòng đấu và mappool.\n\n***Lưu ý:** Do dự án hiện tại chỉ tập trung vào **osu!taiko**, các mode khác có thể sẽ không được hỗ trợ.*`
      },
      setReplayChannel: {
        name: 'đặt-kênh-replay',
        description: 'đặt kênh replay cho vòng đấu',
        noTournament: 'Đồ ngốc, không có giải đấu nào tồn tại trong máy chủ này. Tạo một cái bằng `/tourney make` trước.',
        noPermission: 'Hey! Cậu không có quyền đặt kênh replay đâu, đồ ngốc. Chỉ host và cố vấn mới được làm điều này.',
        roundNotFound: (round: string) => `Đồ ngốc, **${round}** không tồn tại trong giải đấu. Thêm nó trước đi.`,
        success: (round: string, channelId: string) => `Replay cho vòng **${round}** bây giờ sẽ được gửi đến <#${channelId}>.`
      }
    },
    beatmap: {
      name: "tìm-map",
      description: "tìm kiếm, hiển thị thông tin beatmap (kết quả có thể bằng nhiều thứ tiếng)",
      choices: {
        status: [
          { name: "Được xếp hạng", value: "ranked" },
          { name: "Đủ điều kiện", value: "qualified" },
          { name: "Yêu thích", value: "loved" },
          { name: "Chờ xử lý", value: "pending" },
          { name: "Bỏ hoang", value: "graveyard" },
          { name: "Bất kỳ", value: "any" }
        ],
        sort: [
          { name: "Liên quan", value: "relevance" },
          { name: "Ngày (mới nhất)", value: "plays" },
          { name: "Độ khó", value: "difficulty" }
        ],
        langs: [
          { name: "Bất kỳ", value: "any" },
          { name: "Khác", value: "other" },
          { name: "Tiếng Anh", value: "english" },
          { name: "Tiếng Nhật", value: "japanese" },
          { name: "Tiếng Trung", value: "chinese" },
          { name: "Nhạc không lời", value: "instrumental" },
          { name: "Tiếng Hàn", value: "korean" },
          { name: "Tiếng Pháp", value: "french" },
          { name: "Tiếng Đức", value: "german" },
          { name: "Tiếng Thụy Điển", value: "swedish" },
          { name: "Tiếng Tây Ban Nha", value: "spanish" },
          { name: "Tiếng Ý", value: "italian" }
        ],
        genre: [
          { name: "Bất kỳ", value: "any" },
          { name: "Không xác định", value: "unspecified" },
          { name: "Trò chơi điện tử", value: "video-game" },
          { name: "Anime", value: "anime" },
          { name: "Rock", value: "rock" },
          { name: "Pop", value: "pop" },
          { name: "Khác", value: "other" },
          { name: "Mới lạ", value: "novelty" },
          { name: "Hip Hop", value: "hip-hop" },
          { name: "Điện tử", value: "electronic" },
          { name: "Metal", value: "metal" },
          { name: "Cổ điển", value: "classical" },
          { name: "Dân gian", value: "folk" },
          { name: "Jazz", value: "jazz" }
        ]
      },
      noResults: "Không tìm thấy beatmap nào phù hợp với tiêu chí của cậu.",
      nsfwResults: "Đồ ngốc, tất cả kết quả tớ tìm thấy đều là NSFW. Văn minh lên đi chứ.",
      stringSelectDesc: (mapper: string, status: string) => `Người map: ${mapper} | Trạng thái: ${status}`,
      selectPlaceholder: (count: number) => `Đang hiển thị ${count} kết quả hàng đầu. Chọn để xem.`,
      embed: {
        author: (creator: string) => `Được làm bởi ${creator}`,
        description: (id: number) =>
          `:notes: [Xem trước bài hát](https://b.ppy.sh/preview/${id}.mp3) | :frame_photo: [Ảnh bìa/Nền](https://assets.ppy.sh/beatmaps/${id}/covers/raw.jpg)`,
        footer: (count: number, status: string) => `Set này có ${count} beatmap ${status}`,
        status: (status: string, rankedDate?: string) =>
          `${status}${rankedDate ? ` vào ngày ${rankedDate}` : ""}`,
        fieldNames: {
          rawT: 'Tên gốc',
          source: 'Nguồn',
          bpm: "BPM",
          favs: 'Lượt yêu thích',
          spotStats: 'Được đề xuất',
          setId: 'ID của map',
          nsfw: 'Không an toàn',
          updated: 'Cập nhật lần cuối',
          status: 'Tình trạng',
          on: 'vào ngày'
        }
      },
      buttons: {
        osuWebDownload: "Tải xuống từ osu!web",
        osuDirectDownload: "Tải xuống bằng osu!direct"
      },
      apiError: 'O-oh, có gì đó không ổn. Cơ sở dữ liệu của tớ có thể đã chết. Chờ một chút, rồi thử lại.\n\nNếu không có gì thay đổi, sensei của tớ chắc làm sai. Thử báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ`.'
    },
    countryLb: {
      name: "bxh-quốc-gia",
      description: "hiển thị bảng xếp hạng quốc gia cho beatmap",
      invalidCountryCode: 'Đồ ngốc, đó không phải là mã quốc gia 2 chữ cái.',
      choices: {
        sort: [
          { name: "Performance (PP)", value: "performance" },
          { name: "Điểm V3 (lazer)", value: "lazer_score" },
          { name: "Điểm V1 (stable)", value: "stable_score" },
          { name: "Combo", value: "combo" },
          { name: "Độ chính xác", value: "accuracy" }
        ]
      },
      noPlayersFound: (countryCode: string) => `Không tìm thấy ai cho mã quốc gia ${countryCode}. Gõ sai à?`,
      noScoresFound: (countryCode: string) => `Không tìm thấy điểm nào cho ${countryCode} trên beatmap này.`,
      apiError: 'O-oh, có lỗi xảy ra khi lấy bảng xếp hạng quốc gia. Vui lòng thử lại sau.\n\nNói với sensei của tớ bằng `/hỏi-tớ-về lỗi-của-tớ` nếu nó kéo dài quá lâu.',
      embed: {
        title: (artist: string, title: string, version: string) => `${artist} - ${title} [${version}]`,
        author: 'Bảng xếp hạng quốc gia',
        description: (beatmapsetId: number) =>
          `:notes: [Xem trước bài hát](https://b.ppy.sh/preview/${beatmapsetId}.mp3) | :frame_photo: [Ảnh bìa/Nền](https://assets.ppy.sh/beatmaps/${beatmapsetId}/covers/raw.jpg)`,
        footer: (sortString: string, pageIndex: number, totalPages: number) =>
          `Sắp xếp theo ${sortString} | Trang ${pageIndex + 1} trên ${totalPages}`,
        image: (beatmapsetId: number) =>
          `https://assets.ppy.sh/beatmaps/${beatmapsetId}/covers/cover.jpg`
      },
      scoreSet: 'Điểm được thiết lập',
      sortingOptions: ["Performance (PP)", "Điểm V3 (lazer)", "Điểm V1 (stable)", "Combo", "Độ chính xác"]
    },
    profile: {
      name: "tài-khoản",
      description: "hiển thị hồ sơ osu! của người dùng",
      notConfigured: "Cậu chưa cấu hình thông tin trong game của mình, đồ ngốc. Tớ không biết cậu là ai trên osu! đâu.\n\nCấu hình bằng `/osu set` để tớ lưu nó.",
      invalidUsername: "Đồ ngốc, tên người dùng không hợp lệ.",
      userNotFound: "Đồ ngốc, người dùng đó không tồn tại.",
      embed: {
        author: (mode: string, username: string) => `Hồ sơ osu!${mode} của ${username}`,
        description: (profile: {
          rank: string;
          country: string;
          countryRank: string;
          level: string;
          pp: string;
          accuracy: string;
          playCount: string;
          playTime: string;
          grades: string;
        }, combinedGrades: string) => [
          `**▸ Hạng Bancho:** #${profile.rank} (${profile.country}#${profile.countryRank})`,
          `**▸ Cấp độ:** ${profile.level[1]}% của cấp ${profile.level[0]}`,
          `**▸ PP:** ${profile.pp} **▸ Độ chính xác:** ${profile.accuracy}%`,
          `**▸ Số lần chơi:** ${profile.playCount} (${profile.playTime} tiếng)`,
          `**▸ Hạng:** ${combinedGrades}`,
          `**▸ Ảnh hồ sơ:** (từ [lemmmy.pw](https://lemmmy.pw))`
        ].join("\n"),
        footer: "Ooh"
      }
    },
    set: {
      name: "cấu-hình",
      description: "cấu hình tên người dùng và chế độ osu!",
      invalidUsername: 'Đồ ngốc, tên người dùng không hợp lệ.',
      userNotFound: 'Đồ ngốc, người dùng đó không tồn tại.',
      updated: (username: string, mode: string) =>
        `Xong rồi. Tên người dùng hiện tại của cậu là \`${username}\`, và chế độ hiện tại là \`${mode}\`.`,
      sameAsBefore: 'Đó là điều giống như cậu đã làm trước đây mà.'
    },
    timestampChannel: {
      name: "kênh-thời-gian",
      description: "quản lý danh sách kênh timestamp",
      noPermission: "Đồ ngốc, cậu không có quyền **Quản lý Kênh**. Cậu không thể chỉnh sửa cài đặt này.",
      botNoViewPermission: "Đồ ngốc, tớ không thể xem kênh đó. Bật **Xem Kênh** trong quyền, làm ơn.",
      botNoSendPermission: "Đồ ngốc, tớ không thể gửi tin nhắn ở đó. Bật **Gửi Tin Nhắn** trong quyền, làm ơn.",
      internalError: "Sensei của tớ làm gì đó sai rồi. Họ đã được thông báo, vui lòng thử lại vào ngày mai.\n\nXin lỗi vì sự bất tiện này.",
      alreadyExists: (channelId: string) => `Kênh <#${channelId}> đã nằm trong danh sách kênh timestamp.`,
      added: (channelId: string) => `Đã thêm <#${channelId}> vào danh sách kênh timestamp.`
    },
    trackLicense: {
      name: "giấy-phép-bài-hát",
      description: "kiểm tra giấy phép của bài hát hoặc album (kết quả bằng tiếng Anh)",
      apiError: 'O-oh, có gì đó không ổn. Cơ sở dữ liệu của tớ có thể đã chết. Chờ một chút, rồi thử lại.\n\nNếu không có gì thay đổi, sensei của tớ chắc làm sai. Thử báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ`.',
      trackError: (message: string) => `Lỗi khi lấy track: ${message || 'Lỗi không xác định'}`,
      albumError: (message: string) => `Lỗi khi lấy album: ${message || 'Lỗi không xác định'}`,
      unknown: "Không rõ",
      inferredLicensePublicDomain: "Miền Công cộng",
      inferredLicenseCreativeCommons: "Creative Commons (CC)",
      inferredLicenseAllRightsReserved: "Tất cả các quyền được bảo lưu",
      inferredLicenseNote: "*Lưu ý: Suy luận giấy phép có thể không chính xác.*",
      embed: {
        artistField: "Nghệ sĩ",
        albumField: "Album",
        labelField: "Nhãn",
        copyrightField: "Bản quyền",
        inferredLicenseField: "Giấy phép được suy luận"
      }
    },
    verifyArtist: {
      name: "cấp-phép-nghệ-sĩ",
      description: "kiểm tra chính sách cấp phép của nghệ sĩ (kết quả bằng tiếng Anh)",
      notFound: (name: string) =>
        `Tớ không tìm thấy nghệ sĩ nào có tên **${name}**. Vui lòng kiểm tra chính tả và thử lại. Nếu nghệ sĩ tồn tại và cậu biết trạng thái cấp phép của họ, hãy nói với sensei của tớ. Họ sẽ vui lòng thêm nó!\n\nNếu không, cách tốt nhất của cậu là liên hệ trực tiếp với nghệ sĩ và xin phép ở đó.`,
      status: {
        allowed: ":green_square: Được phép",
        mostlyAllowed: ":yellow_square: Hầu hết được phép",
        mostlyDeclined: ":red_square: Hầu hết bị từ chối",
        undetermined: ":question: Không xác định"
      },
      disclaimer: {
        initialText: (count: number) =>
          `- *Nghệ sĩ này có **${count}** tuyên bố từ chối.*\n- *Nếu trường tuyên bố từ chối chỉ chứa tên bài hát, điều đó có nghĩa là cậu không thể sử dụng bài hát đó trong map của mình.*\n`,
        noDisclaimer: "Không có tuyên bố từ chối. Cậu có thể sử dụng bài hát của nghệ sĩ này thoải mái."
      },
      evidence: {
        noEvidence: "Không tìm thấy bằng chứng.",
        evidenceText: (index: number, url: string) => `**\`${index + 1}.\`** [Nhấn vào đây.](${url})\n`
      },
      links: {
        noLinks: "Không tìm thấy liên kết."
      },
      embed: {
        title: (name: string) => `Chính sách của ${name}`,
        fields: {
          links: "Liên kết",
          status: "Trạng thái",
          daysSinceRequest: "Số ngày kể từ khi yêu cầu",
          disclaimer: "Tuyên bố từ chối",
          evidence: "Bằng chứng"
        },
        footer: (dataSource: string) => `Dữ liệu này từ ${dataSource}`
      }
    }
  },
  utility: {
    name: 'công-cụ',
    description: 'vài công cụ để tra cứu một số thứ',
    avatar: {
      name: "avatar",
      description: "lấy avatar của người dùng",
      quality: "Chất lượng: ",
      author: (username: string) => `Ảnh đại diện của ${username}`,
      requestedBy: (username: string) => `Được yêu cầu bởi ${username}`,
      fetchError: "Không thể lấy avatar. Thử lại sau nhé."
    },
    banner: {
      name: "banner",
      description: "lấy banner của người dùng",
      quality: "Chất lượng: ",
      noBanner: "Oh. Người dùng này không có Nitro, hoặc ứng dụng chưa được cấu hình banner.",
      author: (username: string) => `Ảnh nền của ${username}`,
      fetchError: "Discord không cho phép làm điều đó. Thử lại sau nhé?\n\nNếu vẫn không được, sensei của tớ chắc đang dùng phương pháp cũ. Báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.",
      requestedBy: (username: string) => `Được yêu cầu bởi ${username}`
    },
    channel: {
      name: "thông-tin-kênh",
      description: "lấy thông tin kênh",
      notFound: "Discord không cho phép làm điều đó. Thử lại sau nhé?\n\nNếu vẫn không được, sensei của tớ chắc đang dùng phương pháp cũ. Báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.",
      invalidType: "Discord không cho phép làm điều đó. Thử lại sau nhé?\n\nNếu vẫn không được, sensei của tớ chắc đang dùng phương pháp cũ. Báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.",
      infoField: (channelName: string) => `Thông tin của ${channelName}${channelName.endsWith("s") ? "'" : "'s"}`,
      types: {
        text: 'Kênh thường',
        voice: 'Kênh thoại',
        category: 'Nhóm kênh',
        news: 'Kênh thông tin',
        threads: 'Thớt',
        stage: 'Kênh sân khấu',
        dir: 'Nhóm kênh',
        forum: 'Diễn đàn'
      },
      unknown: 'Không rõ',
      info: {
        author: (name: string) => `Thông tin cho ${name}`,
        position: 'Vị trí',
        type: 'Loại kênh',
        created: 'Được tạo vào',
        nsfw: 'An toàn?',
        slowmode: 'Chế độ chậm',
        id: 'ID',
        yes: 'Có',
        no: 'Không',
        topic: 'Chủ đề'
      },
      requestedBy: (username: string) => `Được yêu cầu bởi ${username}`
    },
    github: {
      name: "github",
      description: "lấy thông tin repo từ github (kết quả bằng tiếng Anh)",
      repoNotFound: "Đồ ngốc, repo đó không tồn tại.",
      fetchError: "GitHub không cho phép làm điều đó. Thử lại sau nhé?\n\nNếu vẫn không được, sensei của tớ chắc đang dùng phương pháp cũ. Báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.",
      requestedBy: (username: string) => `Được yêu cầu bởi ${username}`,
      field: (res: {
        language: string | null;
        forks_count: number;
        open_issues: number;
        subscribers_count: number;
        stargazers_count: number;
        archived: boolean;
        disabled: boolean;
        fork: boolean;
      }, license: string, size: string, ctx: CommandContext) =>
        ctx.client.utils.string.keyValueField({
          "Ngôn ngữ": res.language || "Không rõ",
          "Số lần fork": res.forks_count.toLocaleString(),
          "Giấy phép": license,
          "Vấn đề mở": res.open_issues.toLocaleString(),
          "Người theo dõi": res.subscribers_count.toLocaleString(),
          "Số sao": res.stargazers_count.toLocaleString(),
          "Kích thước": size,
          "Đã lưu trữ?": res.archived ? "Có" : "Không",
          "Đã vô hiệu hóa?": res.disabled ? "Có" : "Không",
          "Đã fork?": res.fork ? "Có" : "Không"
        }, 30),
    },
    npm: {
      name: "npm",
      description: "lấy thông tin thư viện trên npm (kết quả bằng tiếng Anh)",
      repoNotFound: "Tớ không tìm thấy repo đó trong hồ sơ. Kiểm tra xem cậu có gõ sai không nhé?\n\nNếu vẫn không được, sensei của tớ chắc đang dùng phương pháp cũ. Báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.",
      fetchError: "npm không cho phép làm điều đó. Thử lại sau nhé?\n\nNếu vẫn không được, sensei của tớ chắc đang dùng phương pháp cũ. Báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.",
      requestedBy: (username: string) => `Được yêu cầu bởi ${username}`,
      keyword: 'Từ khóa',
      maintainer: 'Người quản lý',
      ver: 'Phiên bản',
      author: 'Tác giả',
      modified: 'Được sửa vào',
      score: 'Điểm',
      none: 'Không có',
      registry: 'Thư viện npm'
    },
    screenshot: {
      name: "chụp-màn-hình",
      description: "chụp ảnh màn hình trang web",
      urlError: "Đồ ngốc, đó không phải là một đường liên kết hợp lệ.\n\nĐảm bảo rằng nó bắt đầu với `https://` hoặc `http://`.",
      requestedBy: (username: string) => `Được yêu cầu bởi ${username}`,
      noNsfw: "Ê, ê! Trang web đó tệ lắm nha. Văn hóa lên đi chứ!\n\nCòn không thì vào kênh NSFW cũng được.",
      fetchError: "Tớ đang sửa trình duyệt web của mình, chờ chút nhé! Thử lại sau nhé?\n\nNếu vẫn không được, sensei của tớ chắc đang dùng phương pháp cũ. Báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi."
    },
    server: {
      name: "thông-tin-máy-chủ",
      description: "lấy thông tin của máy chủ",
      notFound: "Discord không cho phép làm điều đó. Thử lại sau nhé?\n\nNếu vẫn không được, sensei của tớ chắc đang dùng phương pháp cũ. Báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.",
      fetchError: "Discord không cho phép làm điều đó. Thử lại sau nhé?\n\nNếu vẫn không được, sensei của tớ chắc đang dùng phương pháp cũ. Báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.",
      requestedBy: (username: string) => `Được yêu cầu bởi ${username}`,
      general: 'Thông tin chung',
      channel: 'Thông tin kênh',
      generalInfo: {
        author: (name: string) => `Thông tin cho ${name}`,
        owner: "Chủ server",
        roleCount: "Số vai trò",
        emojiCount: "Số biểu tượng",
        created: "Được tạo vào",
        boosts: "Ng. nâng cấp",
        mainLocale: "Ngôn ngữ chính",
        verification: "Mức bảo mật",
        filter: "Bộ lọc"
      },
      channelInfo: {
        categories: "Nhóm kênh",
        textChannels: "Kênh thường",
        voiceChannels: "Kênh thoại",
        newsChannels: "Kênh t.tin",
        afkChannel: "Kênh AFK"
      },
      noAfkChannel: "Không có",
      noDescription: "Máy chủ không có mô tả."
    },
    urban: {
      name: "urban",
      description: "tìm định nghĩa trên urban dictionary (kết quả bằng tiếng Anh)",
      noDefinition: "Không tìm thấy định nghĩa nào cho truy vấn của cậu trên Urban Dictionary. Cậu có gõ sai không? Thử lại nhé!\n\nNếu vẫn không được, sensei của tớ chắc đang dùng phương pháp cũ. Báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.",
      profaneQuery: "Nếu cậu muốn tớ tìm kiếm mấy từ NSFW, ít nhất hãy làm điều đó trong kênh NSFW, đồ ngốc!",
      fetchError: "Urban Dictionary không cho phép làm điều đó. Thử lại sau nhé?\n\nNếu vẫn không được, sensei của tớ chắc đang dùng phương pháp cũ. Báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.",
      requestedBy: (username: string) => `Được yêu cầu bởi ${username}`
    },
    wiki: {
      name: "wiki",
      description: "tìm kiếm trên wikipedia",
      profaneQuery: "Nếu cậu muốn tớ tìm kiếm mấy từ NSFW, ít nhất hãy làm điều đó trong kênh NSFW, đồ ngốc!",
      notFound: "Không tìm thấy kết quả. Cậu có gõ sai không? Thử lại nhé!\n\nNếu vẫn không được, sensei của tớ chắc đang dùng phương pháp cũ. Báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.",
      fetchError: "Wikipedia không cho phép làm điều đó. Thử lại sau nhé?\n\nNếu vẫn không được, sensei của tớ chắc đang dùng phương pháp cũ. Báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.",
      requestedBy: (username: string) => `Được yêu cầu bởi ${username}`,
      desc: 'Mô tả',
      extract: 'Đoạn trích',
      none: 'Không có'
    }
  },
  verify: {
    name: 'xác-thực',
    description: 'hệ thống xác thực bằng tài khoản osu!',
    customize: {
      name: 'tùy-chỉnh',
      description: 'tùy chỉnh tin nhắn xác minh',
      editVerification: {
        title: "Chỉnh sửa tin nhắn xác minh",
        fields: {
          title: "Tiêu đề",
          description: "Mô tả",
          thumbnail: "URL ảnh thu nhỏ",
          color: "Màu Embed (Mã Hex)"
        },
        previewUpdated: "Đã cập nhật bản xem trước. Cậu có thể chỉnh sửa thêm hoặc lưu cấu hình."
      },
      saveVerification: {
        noChannelSelected: "Hãy chọn một kênh để đăng tin nhắn xác minh.",
        channelNotFound: "Không tìm thấy kênh đã chọn. Thử lại nhé.",
        messageSaved: "Đã lưu và đăng tin nhắn xác minh trong kênh đã chọn.\n\n**Đừng xóa tin nhắn xác minh.** Cậu sẽ phải thiết lập lại nếu làm vậy."
      },
      roleSelection: {
        placeholder: "Chọn vai trò xác minh",
        roleNotFound: "Không tìm thấy vai trò đã chọn. Thử lại nhé.",
        roleTooHigh: "Đồ ngốc, vai trò đó cao hơn vai trò cao nhất của tớ. Tớ không thể gán nó cho người khác.",
        roleUpdated: "Đã cập nhật vai trò xác minh."
      },
      channelSelection: {
        placeholder: "Chọn kênh xác minh",
        channelNotFound: "Không tìm thấy kênh đã chọn. Thử lại nhé.",
        botNoSendPermission: "Đồ ngốc, tớ không thể gửi tin nhắn ở đó. Bật **Gửi Tin Nhắn** trong quyền, làm ơn.",
        channelUpdated: "Đã cập nhật kênh xác minh."
      },
      preview: {
        content: "Xem trước tin nhắn xác minh:",
        lastUpdated: (date: string) => `Cập nhật lần cuối: ${date}`
      },
      buttons: {
        edit: "Chỉnh sửa",
        save: "Lưu",
        verify: "Xác minh"
      },
      errors: {
        verificationDisabled: "Hệ thống xác minh đang bị tắt. Hãy bật nó trước."
      },
      embed: {
        defaultTitle: "Xác minh tài khoản osu! của cậu",
        defaultDescription: "Nhấn nút bên dưới để xác minh tài khoản osu! của cậu và truy cập server."
      }
    },
    status: {
      name: "trạng-thái",
      description: "trạng thái hệ thống xác minh",
      current: (enabled: boolean) => `Hệ thống xác minh hiện đang ${enabled ? "bật" : "tắt"}.`
    },
    toggle: {
      name: "bật-tắt",
      description: "bật hoặc tắt hệ thống xác minh",
      enabled: "Hệ thống xác minh đã được bật.",
      disabled: "Hệ thống xác minh đã được tắt."
    }
  },
  // ################ Events
  interactionCreate: {
    noDm: 'Tớ không thể làm điều đó trong tin nhắn trực tiếp của cậu, đồ ngốc. Nhưng có thể là một ngày nào đó khác. Sensei nói rằng họ sẽ làm điều đó.',
    startVerif: (baseUrl: string, userId: string, guildId: string) => `Bắt đầu xác minh bằng cách nhấn [vào đây](${baseUrl}/login?id=${userId}&guildId=${guildId}).\n\n*Cậu có thể tắt quyền cho phép lưu trữ thông tin người chơi osu! bằng cách thực hiện lệnh* \`/hỏi-tớ-về quyền [to:lưu thông tin hồ sơ osu! của cậu khi xác minh] [should_be:False]\` ***trước khi** bắt đầu xác minh.*`
  },
  // ################### Utilities
  miscUtil: {
    clickOnTimestamp: '*Nhấn vào dấu thời gian để mở trong trình chỉnh sửa osu!*\n\n',
    httpError: 'Tớ đang sửa mạng dial-up của mình! Chờ một chút, điều này là bình thường đó! Hỏi lại sau một chút nha?',
    cantAnswer: 'Không thể trả lời câu đó. Cơ mà, tớ không biết nói tiếng Việt đâu. Mấy cái cậu đang đọc là do sensei tớ viết, tớ không tự viết ra được. Xin lỗi nha.',
    apiError: 'O-oh, có gì đó không ổn. Cơ sở dữ liệu của tớ có thể đã chết. Chờ một chút, rồi thử lại.\n\nNếu không có gì thay đổi sau đó, sensei của tớ chắc làm gì đó sai rồi. Thử báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` đi.',
    rr: {
      noImOrRe: 'Nè, chèn cả ảnh replay với file replay chứ. File replay phải có đuôi .osr nha.',
      noExtract: 'Tớ không trích xuất được đầy đủ dữ liệu từ ảnh replay của cậu. Ảnh có rõ không vậy? Nhớ để tên người replay nha, đừng để trống.',
      yep: 'Ừ, đúng rồi',
      nop: 'Không phải',
      closest: (name: string) => `Kết quả sát nhất tớ tìm được trong mappool là **${name}**. Có phải nó không cậu?`,
      unknown: 'Không rõ',
      matched: (slot: string, round: string, replayer: string) => `Được rồi, tớ nhận nhé. Replay này là cho **${slot}** của mappool vòng **${round}**, được chơi bởi **${replayer}**.`,
      closestMatched: (closest: string) => `Đã so sánh với **${closest}**.`,
      reject: 'Ừ, được rồi. Cậu chụp bức hình rõ hơn một chút nhé, hoặc là báo với host để nhận thủ công cũng được.',
      noRes: 'Tớ không nhận được phản hồi nào cả. Thử lại nhé.',
      err: 'O-oh, có gì đó không ổn. Cơ sở dữ liệu của tớ có thể đã chết. Chờ một chút, rồi thử lại nha?\n\nNếu không có gì thay đổi, sensei của tớ chắc làm gì đó sai rồi. Thử báo cáo bằng `/hỏi-tớ-về lỗi-của-tớ` nha.'
    }
  },
  aniSchedule: {
    episodeUp: (episode: number, title: string, siteUrl: string) =>
      `Này cậu, tập **${episode}** của **[${title}](${siteUrl})** vừa mới ra mắt đó`,
    finalEpisode: " **(đây là tập cuối)** ",
    watch: (links: string) => `\n\nXem: ${links}`,
    noWatch: "\n\nXem: *Chưa có*",
    visit: (links: string) => `\n\nGhé thăm: ${links}`,
    noVisit: "\n\nGhé thăm: *Chưa có*",
    delayNotice: "\n\nCó thể mất một chút thời gian để xuất hiện trên các dịch vụ trên.",
    randomRemarks: [
      "Không phải tớ muốn nhắc cậu hay gì đâu.",
      "Sensei bắt tớ nhắn tin cho cậu. Tớ không muốn làm điều đó.",
      "Được rồi, tớ quay lại công việc của mình.",
      "Dù cậu biết điều này hay không thì cũng không quan trọng. Đây là công việc của tớ.",
      "Mà, cậu có thấy sensei của tớ không?",
      "Không ngờ là cậu gặp tớ ở đây, đúng không."
    ],
    embed: {
      footer: {
        format: `Định dạng: `,
        duration: (duration: number) => `Thời lượng: ${duration} phút`,
        studio: `Studio: `,
        unknown: 'Chưa biết'
      }
    }
  }
} satisfies typeof English;
