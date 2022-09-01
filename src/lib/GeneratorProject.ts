import { ICreateProject } from '../../types/lib/create'
import { getDownloadUrl, getRepoList } from '../utils/serves'
import { cyanText, dimText, errorText, handleLoading } from '../utils/utils'
import downloadGitRepo from 'download-git-repo'
import inquirer from 'inquirer'
import util from 'util'
import path from 'path'

/**
 * 创建项目类
 */
class GeneratorProject extends ICreateProject {
  name: string // 文件名
  targetDir: string // 目标路径
  constructor(name: string, targetDir: string) {
    super()
    this.name = name
    this.targetDir = targetDir
  }

  /**
   * 下载模板
   * @param repo - 模板名称
   */
  async handleDownload(repo: string) {
    const requestUrl = getDownloadUrl(repo)
    // 下载方法添加promise
    const download = util.promisify(downloadGitRepo)
    // 获取参数位置
    const targetDir = path.resolve(process.cwd(), this.targetDir)

    // 调用下载
    try {
      await handleLoading(
        download(requestUrl, targetDir),
        '下载代码中...'
      )
    } catch(err) {
      // 错误处理
      console.log(errorText('\n  下载失败'))
    }
  }

  /** 获取GitHub模板 */
  async handleGetRepo() {
    try {
      // 获取模板列表
      const repoList = await handleLoading(getRepoList(), '获取项目列表中...')
      if (!repoList) return console.log('\n  暂无项目列表数据')
      // 过滤获取名称
      const repos = repoList.map((item: { name: string }) => item.name)

      // 咨询用户选择项目
      const { repo } = await inquirer.prompt({
        name: 'repo',
        type: 'list',
        choices: repos,
        message: '请选择项目:'
      })

      return repo
    } catch(err) {
      console.log(errorText('\n  获取项目列表失败'))
    }
  }

  /** 创建处理 */
  async handleCreate() {
    try {
      // 获取模板
      const repo = await this.handleGetRepo()
      console.log(dimText(`  获取项目列表成功`))

      // 执行下载
      await this.handleDownload(repo)

      // 模板使用提示
      console.log(`\r\n创建项目${cyanText(this.name)}成功,请执行以下操作:`)
      console.log(`\r\n  cd ${cyanText(this.name)}`)
      console.log('  yarn\r')
      console.log('  yarn dev\r\n')
    } catch(err) {
      console.log(errorText('\n  创建失败'))
    }
  }
}

export default GeneratorProject