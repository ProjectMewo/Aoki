import type { LocaleString } from "seyfert/lib/types";
interface Locale {
  name?: [language: LocaleString, value: string][];
  description?: [language: LocaleString, value: string][];
}
// this file contains all localized option descriptions and
// suppliers for the @Locale decorator for every command
// since this is static data existing entries will not be changed
// which makes it redundant to have these raw in command files
export const meta = {
  anime: {
    schedule: {
      add: {
        desc: {
          "en-US": 'the anime to subscribe to',
          "vi": 'bộ anime mà cậu muốn đăng ký'
        },
        loc: {
          name: [
            ['en-US', 'add'],
            ['vi', 'thêm']
          ],
          description: [
            ['en-US', 'subscribe to anime episode notifications'],
            ['vi', 'đăng ký nhận thông báo tập mới']
          ]
        } as Locale
      },
      current: {
        loc: {
          name: [
            ['en-US', 'current'],
            ['vi', 'hiện-tại']
          ],
          description: [
            ['en-US', 'get information about your currently subscribed anime'],
            ['vi', 'xem thông tin về anime cậu đang theo dõi']
          ]
        } as Locale
      },
      remove: {
        loc: {
          name: [
            ['en-US', 'remove'],
            ['vi', 'gỡ-bỏ']
          ],
          description: [
            ['en-US', 'remove your current anime subscription'],
            ['vi', 'gỡ bỏ đăng ký anime hiện tại của cậu']
          ]
        } as Locale
      }
    },
    action: {
      desc: {
        "en-US": "the type of action to get",
        "vi": "loại hành động cậu muốn lấy"
      },
      loc: {
        name: [
          ['en-US', 'action'],
          ['vi', 'hành-động']
        ],
        description: [
          ['en-US', 'get a random anime action image'],
          ['vi', 'lấy một hình ảnh hành động anime ngẫu nhiên']
        ]
      } as Locale
    },
    airing: {
      desc: {
        "en-US": 'day of the week',
        "vi": 'ngày trong tuần'
      },
      loc: {
        name: [
          ['en-US', 'airing'],
          ['vi', 'lịch-chiếu']
        ],
        description: [
          ['en-US', 'get a list of anime airing on a specific day'],
          ['vi', 'xem danh sách anime phát sóng theo ngày']
        ]
      } as Locale
    },
    gelbooru: {
      tags: {
        "en-US": 'tags to search for (separate with spaces)',
        "vi": 'các thẻ để tìm kiếm (ngăn cách bằng dấu cách)'
      },
      rating: {
        "en-US": 'rating of the images. Default safe.',
        "vi": 'xếp hạng của hình ảnh. Mặc định là an toàn.'
      },
      loc: {
        name: [
          ['en-US', 'gelbooru'],
          ['vi', 'tìm-gelbooru']
        ],
        description: [
          ['en-US', 'search for anime images on Gelbooru'],
          ['vi', 'tìm kiếm hình ảnh anime trên Gelbooru']
        ]
      } as Locale
    },
    profile: {
      platform: {
        "en-US": "the platform to search on",
        "vi": "nền tảng để tìm kiếm"
      },
      username: {
        "en-US": "the username to search for",
        "vi": "tên người dùng để tìm kiếm"
      },
      loc: {
        name: [
          ['en-US', 'profile'],
          ['vi', 'hồ-sơ']
        ],
        description: [
          ['en-US', 'get an anime profile from MyAnimeList or AniList'],
          ['vi', 'lấy hồ sơ anime từ MyAnimeList hoặc AniList']
        ]
      } as Locale
    },
    quote: {
      loc: {
        name: [
          ['en-US', 'quote'],
          ['vi', 'trích-dẫn']
        ],
        description: [
          ['en-US', 'get a random anime quote.'],
          ['vi', 'lấy một câu trích dẫn anime ngẫu nhiên.']
        ]
      } as Locale
    },
    random: {
      desc: {
        "en-US": 'The type of content to get',
        "vi": 'Loại nội dung cậu muốn lấy'
      },
      loc: {
        name: [
          ['en-US', 'random'],
          ['vi', 'ngẫu-nhiên']
        ],
        description: [
          ['en-US', 'get a random anime or manga from MyAnimeList'],
          ['vi', 'lấy một anime hoặc manga ngẫu nhiên từ MyAnimeList']
        ]
      } as Locale
    },
    search: {
      type: {
        "en-US": 'content type to search for',
        "vi": 'loại nội dung cậu muốn tìm kiếm'
      },
      query: {
        "en-US": 'search query',
        "vi": 'từ khóa tìm kiếm'
      },
      loc: {
        name: [
          ['en-US', 'search'],
          ['vi', 'tìm-kiếm']
        ],
        description: [
          ['en-US', 'search for anime, manga, characters, or people on MyAnimeList'],
          ['vi', 'tìm kiếm anime, manga, nhân vật, hoặc người trên MyAnimeList']
        ]
      } as Locale
    }
  },
  fun: {
    "8ball": {
      desc: {
        "en-US": 'the question to ask the 8-ball',
        "vi": 'câu hỏi cậu muốn hỏi bi số 8'
      },
      loc: {
        name: [
          ['en-US', '8ball'],
          ['vi', '8ball']
        ],
        description: [
          ['en-US', 'ask the magic 8-ball a question.'],
          ['vi', 'hỏi bi số 8 một câu hỏi.']
        ]
      } as Locale
    },
    advice: {
      loc: {
        name: [
          ['en-US', 'advice'],
          ['vi', 'lời-khuyên']
        ],
        description: [
          ['en-US', 'get a random piece of advice.'],
          ['vi', 'nhận một lời khuyên ngẫu nhiên.']
        ]
      } as Locale
    },
    affirmation: {
      loc: {
        name: [
          ['en-US', 'affirmation'],
          ['vi', 'khẳng-định']
        ],
        description: [
          ['en-US', 'get a positive affirmation to brighten your day.'],
          ['vi', 'nhận một lời khẳng định tích cực để làm bừng sáng ngày của cậu.']
        ]
      } as Locale
    },
    fact: {
      loc: {
        name: [
          ['en-US', 'fact'],
          ['vi', 'sự-thật']
        ],
        description: [
          ['en-US', 'get a random fact.'],
          ['vi', 'lấy một sự thật ngẫu nhiên.']
        ]
      } as Locale
    },
    fortune: {
      loc: {
        name: [
          ['en-US', 'fortune'],
          ['vi', 'bánh-quy-may-mắn']
        ],
        description: [
          ['en-US', 'get your daily fortune cookie.'],
          ['vi', 'nhận bánh quy may mắn hàng ngày của cậu.']
        ]
      } as Locale
    },
    generator: {
      template: {
        "en-US": 'the template ID to use',
        "vi": 'ID mẫu cậu muốn sử dụng (không hỗ trợ tiếng Việt)'
      },
      top: {
        "en-US": 'the top text of the meme',
        "vi": 'văn bản trên của meme'
      },
      bottom: {
        "en-US": 'the bottom text of the meme',
        "vi": 'văn bản dưới của meme'
      },
      loc: {
        name: [
          ['en-US', 'generator'],
          ['vi', 'trình-tạo']
        ],
        description: [
          ['en-US', 'generate a meme using a template.'],
          ['vi', 'tạo meme bằng mẫu.']
        ]
      } as Locale
    },
    owo: {
      desc: {
        "en-US": 'the text to convert to OwO speak',
        "vi": 'văn bản để chuyển đổi sang ngôn ngữ OwO'
      },
      loc: {
        name: [
          ['en-US', 'owo'],
          ['vi', 'owo']
        ],
        description: [
          ['en-US', 'convert your text to OwO speak.'],
          ['vi', 'chuyển văn bản của cậu sang ngôn ngữ OwO.']
        ]
      } as Locale
    },
    ship: {
      first: {
        "en-US": 'the first user to ship',
        "vi": 'người đầu tiên cậu muốn ghép đôi'
      },
      second: {
        "en-US": 'the second user to ship',
        "vi": 'người thứ hai cậu muốn ghép đôi'
      },
      loc: {
        name: [
          ['en-US', 'ship'],
          ['vi', 'ghép-đôi']
        ],
        description: [
          ['en-US', 'ship two users together and see their compatibility.'],
          ['vi', 'ghép đôi hai người và xem độ hợp nhau của họ.']
        ]
      } as Locale
    },
    today: {
      loc: {
        name: [
          ['en-US', 'today'],
          ['vi', 'hôm-nay']
        ],
        description: [
          ['en-US', 'get a historical event that happened on today\'s date.'],
          ['vi', 'lấy sự kiện lịch sử đã xảy ra vào ngày hôm nay.']
        ]
      } as Locale
    },
    truth: {
      loc: {
        name: [
          ['en-US', 'truth'],
          ['vi', 'câu-hỏi-sự-thật']
        ],
        description: [
          ['en-US', 'get a random truth question for truth or dare.'],
          ['vi', 'nhận một câu hỏi sự thật ngẫu nhiên cho trò chơi thật hay dám.']
        ]
      } as Locale
    }
  },
  my: {
    beta: {
      reason: {
        "en-US": 'reason for requesting beta access',
        "vi": 'lý do cậu yêu cầu quyền truy cập beta'
      },
      loc: {
        name: [
          ['en-US', 'beta'],
          ['vi', 'beta']
        ],
        description: [
          ['en-US', 'ask my sensei to be whitelisted for beta programs'],
          ['vi', 'yêu cầu sensei thêm máy chủ của cậu vào danh sách quyền truy cập beta']
        ]
      } as Locale
    },
    fault: {
      query: {
        "en-US": 'description of the issue',
        "vi": 'mô tả vấn đề'
      },
      attachment: {
        "en-US": 'an image related to the issue',
        "vi": 'một hình ảnh liên quan đến vấn đề'
      },
      loc: {
        name: [
          ['en-US', 'fault'],
          ['vi', 'lỗi-của-tớ']
        ],
        description: [
          ['en-US', 'report an issue with the bot'],
          ['vi', 'báo cáo một vấn đề với tớ']
        ]
      } as Locale
    },
    info: {
      loc: {
        name: [
          ['en-US', 'info'],
          ['vi', 'thông-tin']
        ],
        description: [
          ['en-US', 'get information about me'],
          ['vi', 'lấy thông tin về tớ']
        ]
      } as Locale
    },
    invite: {
      loc: {
        name: [
          ['en-US', 'invite'],
          ['vi', 'lời-mời']
        ],
        description: [
          ['en-US', 'take me to your server.'],
          ['vi', 'mời tớ vào máy chủ của cậu.']
        ]
      } as Locale
    },
    language: {
      desc: {
        "en-US": 'the language you want me to speak',
        "vi": 'ngôn ngữ cậu muốn tớ dùng để phản hồi'
      },
      loc: {
        name: [
          ['en-US', 'language'],
          ['vi', 'ngôn-ngữ']
        ],
        description: [
          ['en-US', 'configure the language you want me to speak to you'],
          ['vi', 'cấu hình ngôn ngữ tớ sẽ dùng để phản hồi']
        ]
      } as Locale
    },
    ping: {
      loc: {
        name: [
          ['en-US', 'ping'],
          ['vi', 'kiểm-tra']
        ],
        description: [
          ['en-US', 'see if I respond.'],
          ['vi', 'kiểm tra xem tớ có phản hồi không.']
        ]
      } as Locale
    },
    rights: {
      to: {
        "en-US": 'what permission to configure',
        "vi": 'quyền mà cậu muốn cấu hình'
      },
      should_be: {
        "en-US": 'whether I should do it or not',
        "vi": 'liệu tớ có nên làm điều đó hay không'
      },
      loc: {
        name: [
          ['en-US', 'rights'],
          ['vi', 'quyền-cá-nhân']
        ],
        description: [
          ['en-US', 'configure your personal privacy settings'],
          ['vi', 'cấu hình quyền riêng tư cá nhân của cậu']
        ]
      } as Locale
    },
    stats: {
      loc: {
        name: [
          ['en-US', 'stats'],
          ['vi', 'thống-kê']
        ],
        description: [
          ['en-US', "the nerdy statistics of how I'm working."],
          ['vi', "thống kê thô về cách tớ đang hoạt động."]
        ]
      } as Locale
    }
  },
  osu: {
    mappool: {
      approve: {
        slot: {
          "en-US": 'the slot to add this map to',
          "vi": 'vị trí để thêm map này'
        },
        url: {
          "en-US": 'the beatmap URL (must include difficulty ID)',
          "vi": 'URL của map (phải bao gồm ID độ khó)'
        },
        loc: {
          name: [
            ['en-US', 'approve'],
            ['vi', 'duyệt']
          ],
          description: [
            ['en-US', 'approve a map and move it to the current round\'s finalized mappool.'],
            ['vi', 'duyệt một map và chuyển nó vào mappool đã chốt của vòng hiện tại.']
          ]
        } as Locale
      },
      replays: {
        round: {
          "en-US": 'the round to view replays for',
          "vi": 'vòng đấu mà cậu muốn xem replay'
        },
        loc: {
          name: [
            ['en-US', 'replays'],
            ['vi', 'xem-replay']
          ],
          description: [
            ['en-US', 'view saved replays for a specific round or the current mappool'],
            ['vi', 'xem lại các replay đã lưu']
          ]
        } as Locale
      },
      suggest: {
        slot: {
          "en-US": 'the slot to suggest this map to',
          "vi": 'slot mà cậu muốn đề xuất map này'
        },
        url: {
          "en-US": 'the beatmap URL (must include difficulty ID)',
          "vi": 'URL của beatmap (phải bao gồm ID độ khó)'
        },
        confirm: {
          "en-US": 'confirm you know the correct current round is set',
          "vi": 'xác nhận rằng cậu biết vòng hiện tại đã được đặt đúng'
        },
        loc: {
          name: [
            ['en-US', 'suggest'],
            ['vi', 'đề-xuất']
          ],
          description: [
            ['en-US', 'suggest a new map for this mappool slot.'],
            ['vi', 'đề xuất một map mới cho slot mappool này.']
          ]
        } as Locale
      },
      view_suggestions: {
        loc: {
          name: [
            ['en-US', 'view-suggestions'],
            ['vi', 'xem-đề-xuất']
          ],
          description: [
            ['en-US', 'view all map suggestions for the current round.'],
            ['vi', 'xem tất cả đề xuất map cho vòng hiện tại.']
          ]
        } as Locale
      },
      view: {
        loc: {
          name: [
            ['en-US', 'view'],
            ['vi', 'xem']
          ],
          description: [
            ['en-US', 'view the finalized mappool for the current round.'],
            ['vi', 'xem mappool đã chốt cho vòng hiện tại.']
          ]
        } as Locale
      }
    },
    tourney: {
      add_role: {
        roleset: {
          "en-US": 'the roleset to add the role to (e.g., host, advisor, mappooler)',
          "vi": 'bộ vai trò để thêm vai trò vào (ví dụ: host, advisor, mappooler)'
        },
        role: {
          "en-US": 'the role to add to the selected roleset',
          "vi": 'vai trò để thêm vào bộ vai trò đã chọn'
        },
        loc: {
          name: [
            ['en-US', 'add-role'],
            ['vi', 'thêm-vai-trò']
          ],
          description: [
            ['en-US', 'add additional roles to a tournament roleset'],
            ['vi', 'thêm vai trò bổ sung vào bộ vai trò của giải đấu']
          ]
        } as Locale
      },
      add_round: {
        round: {
          "en-US": 'the tournament round to add',
          "vi": 'vòng đấu giải đấu cậu muốn thêm'
        },
        slots: {
          "en-US": 'mappool slots separated by comma (e.g. NM1,NM2)',
          "vi": 'các slot mappool được phân tách bằng dấu phẩy (ví dụ: NM1,NM2)'
        },
        set_current: {
          "en-US": 'set this as the current active round',
          "vi": 'đặt đây là vòng đấu hiện tại'
        },
        loc: {
          name: [
            ['en-US', 'add-round'],
            ['vi', 'thêm-vòng']
          ],
          description: [
            ['en-US', 'add a tournament round with mappool slots'],
            ['vi', 'thêm một vòng đấu với các slot mappool']
          ]
        } as Locale
      },
      current: {
        round: {
          "en-US": 'set this as the current active round',
          "vi": 'đặt vòng này làm vòng hiện tại'
        },
        loc: {
          name: [
            ['en-US', 'current'],
            ['vi', 'vòng-hiện-tại']
          ],
          description: [
            ['en-US', 'view or set the current tournament round'],
            ['vi', 'xem hoặc đặt vòng hiện tại của giải đấu']
          ]
        } as Locale
      },
      delete: {
        loc: {
          name: [
            ['en-US', 'delete'],
            ['vi', 'xóa']
          ],
          description: [
            ['en-US', 'delete the current tournament in this server'],
            ['vi', 'xóa giải đấu hiện tại trong máy chủ này']
          ]
        } as Locale
      },
      make: {
        name: {
          "en-US": 'full name of the tournament',
          "vi": 'tên đầy đủ của giải đấu'
        },
        abbreviation: {
          "en-US": 'short form (abbreviation) of the tournament',
          "vi": 'viết tắt của giải đấu'
        },
        host_role: {
          "en-US": 'the role for tournament hosts/organizers',
          "vi": 'vai trò cho người tổ chức giải đấu'
        },
        advisor_role: {
          "en-US": 'the role for tournament advisors',
          "vi": 'vai trò cho cố vấn giải đấu'
        },
        mappooler_role: {
          "en-US": 'the role for tournament mappoolers',
          "vi": 'vai trò cho người làm mappool giải đấu'
        },
        tester_role: {
          "en-US": 'the role for tournament testplayers/replayers',
          "vi": 'vai trò cho người test/replay giải đấu'
        },
        loc: {
          name: [
            ['en-US', 'make'],
            ['vi', 'tạo-giải']
          ],
          description: [
            ['en-US', 'create a new tournament in this server'],
            ['vi', 'tạo một giải đấu mới trong máy chủ này']
          ]
        } as Locale
      },
      remove_round: {
        round: {
          "en-US": 'the tournament round to remove',
          "vi": 'vòng đấu giải đấu cậu muốn xóa'
        },
        loc: {
          name: [
            ['en-US', 'remove-round'],
            ['vi', 'xóa-vòng']
          ],
          description: [
            ['en-US', 'remove a tournament round'],
            ['vi', 'xóa một vòng đấu giải đấu']
          ]
        } as Locale
      },
      set_replay_channel: {
        channel: {
          "en-US": 'the channel to set for replays',
          "vi": 'kênh để đặt cho phát lại'
        },
        round: {
          "en-US": 'the round this channel is for',
          "vi": 'vòng đấu mà kênh này dành cho'
        },
        loc: {
          name: [
            ['en-US', 'set-replay-channel'],
            ['vi', 'đặt-kênh-replay']
          ],
          description: [
            ['en-US', 'set a channel for replays for a specific round'],
            ['vi', 'đặt kênh cho phát lại cho một vòng đấu cụ thể']
          ]
        } as Locale
      },
      track_license: {
        track: {
          "en-US": 'the Spotify track name to search for',
          "vi": 'tên bài hát Spotify mà cậu muốn tìm kiếm'
        },
        loc: {
          name: [
            ['en-US', 'track-license'],
            ['vi', 'giấy-phép-bài-hát']
          ],
          description: [
            ['en-US', 'get licensing information for a Spotify track. Not reliable.'],
            ['vi', 'lấy thông tin giấy phép cho một bài hát Spotify. Không đảm bảo chính xác.']
          ]
        } as Locale
      },
      verify_artist: {
        name: {
          "en-US": "the name of the artist to verify",
          "vi": "tên của nghệ sĩ cậu muốn kiểm tra"
        },
        loc: {
          name: [
            ['en-US', 'verify-artist'],
            ['vi', 'kiểm-tra-nghệ-sĩ']
          ],
          description: [
            ['en-US', "check this artist's policies before using their songs"],
            ['vi', "kiểm tra chính sách của nghệ sĩ này trước khi sử dụng bài hát của họ"]
          ]
        } as Locale
      }
    },
    beatmap: {
      query: {
        "en-US": "search query for the beatmap",
        "vi": "truy vấn tìm kiếm cho beatmap"
      },
      mode: {
        "en-US": "filter by game mode",
        "vi": "lọc theo chế độ chơi"
      },
      status: {
        "en-US": "filter by ranked status",
        "vi": "lọc theo trạng thái xếp hạng"
      },
      sort: {
        "en-US": "sort the results",
        "vi": "sắp xếp kết quả"
      },
      genre: {
        "en-US": "filter by music genre",
        "vi": "lọc theo thể loại nhạc"
      },
      language: {
        "en-US": "filter by language",
        "vi": "lọc theo ngôn ngữ"
      },
      storyboard: {
        "en-US": "filter maps with storyboards",
        "vi": "lọc các map có storyboard"
      },
      loc: {
        name: [
          ['en-US', 'beatmap'],
          ['vi', 'tìm-map']
        ],
        description: [
          ['en-US', 'search for beatmaps by query'],
          ['vi', 'tìm kiếm beatmap bằng truy vấn']
        ]
      } as Locale
    },
    country_leaderboard: {
      beatmap_id: {
        "en-US": "the beatmap ID to check",
        "vi": "ID của beatmap cần kiểm tra"
      },
      country_code: {
        "en-US": "the country code (2 letters)",
        "vi": "mã quốc gia (2 chữ cái)"
      },
      mode: {
        "en-US": "the game mode to check",
        "vi": "chế độ chơi cần kiểm tra"
      },
      sort: {
        "en-US": "how to sort the results",
        "vi": "cách sắp xếp kết quả"
      },
      loc: {
        name: [
          ['en-US', 'country-leaderboard'],
          ['vi', 'bxh-quốc-gia']
        ],
        description: [
          ['en-US', 'get a country leaderboard for a specific beatmap'],
          ['vi', 'xem bảng xếp hạng quốc gia cho một beatmap cụ thể']
        ]
      } as Locale
    },
    profile: {
      username: {
        "en-US": 'the osu! username to look up (defaults to your configured username)',
        "vi": 'tên người dùng osu! cậu muốn tra cứu (mặc định là tên đã cấu hình của cậu)'
      },
      mode: {
        "en-US": 'the game mode to look up (defaults to your configured mode)',
        "vi": 'chế độ chơi cậu muốn tra cứu (mặc định là chế độ đã cấu hình của cậu)'
      },
      loc: {
        name: [
          ['en-US', 'profile'],
          ['vi', 'hồ-sơ']
        ],
        description: [
          ['en-US', 'get osu! profile information'],
          ['vi', 'lấy thông tin hồ sơ osu!']
        ]
      } as Locale
    },
    set: {
      username: {
        "en-US": "your osu! username",
        "vi": "tên người dùng osu! của cậu"
      },
      mode: {
        "en-US": "your preferred mode",
        "vi": "chế độ cậu muốn đặt làm mặc định"
      },
      loc: {
        name: [
          ['en-US', 'set'],
          ['vi', 'cấu-hình']
        ],
        description: [
          ['en-US', 'set your osu! username and default mode'],
          ['vi', 'đặt tên người dùng osu! và chế độ mặc định của cậu']
        ]
      } as Locale
    },
    timestamp_channel: {
      channel: {
        "en-US": 'the channel to send beatmap timestamps to',
        "vi": 'kênh để gửi dấu thời gian của beatmap'
      },
      loc: {
        name: [
          ['en-US', 'add-timestamp-channel'],
          ['vi', 'kênh-dấu-thời-gian']
        ],
        description: [
          ['en-US', 'add a channel for detecting osu! editor timestamps'],
          ['vi', 'thêm một kênh để phát hiện dấu thời gian của osu! editor']
        ]
      } as Locale
    }
  },
  utility: {
    avatar: {
      user: {
        "en-US": 'the user to get the avatar of',
        "vi": 'người dùng mà cậu muốn lấy ảnh đại diện'
      },
      loc: {
        name: [
          ['en-US', 'avatar'],
          ['vi', 'ảnh-đại-diện']
        ],
        description: [
          ['en-US', 'get the avatar of a user'],
          ['vi', 'lấy ảnh đại diện của một người dùng']
        ]
      } as Locale
    },
    banner: {
      user: {
        "en-US": "the user to get the banner of",
        "vi": "người dùng mà cậu muốn lấy biểu ngữ"
      },
      loc: {
        name: [
          ['en-US', 'banner'],
          ['vi', 'biểu-ngữ']
        ],
        description: [
          ['en-US', 'get the banner of a user'],
          ['vi', 'lấy biểu ngữ của một người dùng']
        ]
      } as Locale
    },
    channel: {
      channel: {
        "en-US": 'the channel to get information about',
        "vi": 'kênh mà cậu muốn lấy thông tin'
      },
      loc: {
        name: [
          ['en-US', 'channel'],
          ['vi', 'kênh']
        ],
        description: [
          ['en-US', 'get information about a channel'],
          ['vi', 'lấy thông tin về một kênh']
        ]
      } as Locale
    },
    github: {
      user: {
        "en-US": 'the GitHub username',
        "vi": 'tên người dùng GitHub'
      },
      repo: {
        "en-US": 'the repository name',
        "vi": 'tên repository'
      },
      loc: {
        name: [
          ['en-US', 'github'],
          ['vi', 'github']
        ],
        description: [
          ['en-US', 'get information about a GitHub repository'],
          ['vi', 'lấy thông tin về một repository trên GitHub']
        ]
      } as Locale
    },
    npm: {
      query: {
        "en-US": 'the library name to search for',
        "vi": 'tên thư viện cậu muốn tìm kiếm'
      },
      loc: {
        name: [
          ['en-US', 'npm'],
          ['vi', 'npm']
        ],
        description: [
          ['en-US', 'search for an npm library'],
          ['vi', 'tìm kiếm một thư viện npm']
        ]
      } as Locale
    },
    screenshot: {
      query: {
        "en-US": 'the URL to take a screenshot of',
        "vi": 'URL để chụp ảnh màn hình'
      },
      loc: {
        name: [
          ['en-US', 'screenshot'],
          ['vi', 'chụp-ảnh-màn-hình']
        ],
        description: [
          ['en-US', 'take a screenshot of a website'],
          ['vi', 'chụp ảnh màn hình của một trang web']
        ]
      } as Locale
    },
    server: {
      loc: {
        name: [
          ['en-US', 'server'],
          ['vi', 'máy-chủ']
        ],
        description: [
          ['en-US', 'get information about the server'],
          ['vi', 'lấy thông tin về máy chủ']
        ]
      } as Locale
    },
    urban: {
      query: {
        "en-US": "the term to search for",
        "vi": "thuật ngữ cậu muốn tìm kiếm"
      },
      loc: {
        name: [
          ['en-US', 'urban'],
          ['vi', 'từ-điển-đường-phố']
        ],
        description: [
          ['en-US', 'search for a definition on Urban Dictionary'],
          ['vi', 'tìm kiếm định nghĩa trên Từ điển Đường phố']
        ]
      } as Locale
    },
    wiki: {
      query: {
        "en-US": 'the term to search for',
        "vi": 'thuật ngữ cậu muốn tìm kiếm'
      },
      loc: {
        name: [
          ['en-US', 'wiki'],
          ['vi', 'bách-khoa']
        ],
        description: [
          ['en-US', 'search for information on Wikipedia'],
          ['vi', 'tìm kiếm thông tin trên Wikipedia']
        ]
      } as Locale
    }
  },
  verify: {
    customize: {
      loc: {
        name: [
          ['en-US', 'customize'],
          ['vi', 'tùy-chỉnh']
        ],
        description: [
          ['en-US', 'customize the verification message'],
          ['vi', 'tùy chỉnh tin nhắn xác minh']
        ]
      } as Locale
    },
    status: {
      loc: {
        name: [
          ['en-US', 'status'],
          ['vi', 'trạng-thái']
        ],
        description: [
          ['en-US', 'check the verification status for this server'],
          ['vi', 'kiểm tra trạng thái xác minh cho máy chủ này']
        ]
      } as Locale
    },
    toggle: {
      loc: {
        name: [
          ['en-US', 'toggle'],
          ['vi', 'bật-tắt']
        ],
        description: [
          ['en-US', 'toggle the verification system for this server'],
          ['vi', 'bật tắt hệ thống xác minh cho máy chủ này']
        ]
      } as Locale
    }
  }
}