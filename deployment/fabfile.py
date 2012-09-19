#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# USAGE: fab -uUser -Hhost1,host2 task1 task2
#
#        --set userconfigs="file1.json file2.json"
#        --set baseconfname="baseconfig.json"
#        --set confdir="path"
#
# menu is the default task
#


import re
import string
import json
import types
import os
from fabric.api import *
from fabric.operations import *
from fabric.contrib import *

env.shell = "/bin/bash -c"

env.m4ed_printmain = True
env.m4ed_printconf = True

# You can set these from fab command line using:
# --set confdir="path"
# --set baseconfname="file.json"
# --set userconfigs="file1.json file2.json"

if not hasattr(env, "confdir"):
    env.confdir = "fabconfigs"
if not hasattr(env, "baseconfname"):
    env.baseconfname = "baseconfig.json"
if not hasattr(env, "userconfigs"):
    env.userconfigs = ""
if not hasattr(env, "m4ed"):
    env.m4ed = {}


# ----------------------------------------------------------------------------
# User menus
# ----------------------------------------------------------------------------

@task(alias="help")
def _help():
    _mprint("Usage examples: ", ff=True)
    _mprint("\t fab -H<hostname>", c="bcyan")
    _mprint("\t fab -H<hostname> --set userconfigs=\"file1.json file2.json\"",
           c="bcyan")
    _mprint("\t fab -H<hostname1>,<hostname2>,<hostname3>", c="bcyan")
    _mprint("\t fab -u<user> -H<hostname>", c="bcyan")
    _mprint("", lf=True)
    _mprint("You can set alternative paths from fab command line using:")
    _mprint("\t--set confdir=\"path\"", c="bblack")
    _mprint("\t--set baseconfname=\"file.json\"", c="bblack")
    _mprint("\t--set userconfigs=\"file1.json file2.json\"", c="bblack")
    _mprint("", lf=True)


@task(default=True)
def _menu_main():
    if not env.host:
        _mprint("provide a host: fab -Hhostname", st="fail")
        return False
    quitstrings = ("0", "q", "quit", "exit")
    if env.m4ed_printconf:
        with settings(hide('stdout', 'running', 'warnings'), warn_only=True):
            _mprint("we need your sudo pass. Don't panic, there's a menu",
                    lf=True, ff=True, title=True, c="byellow")
            sudo("uname -a")
        os.system(['clear', 'cls'][os.name == 'nt'])
        #_mprint(_m4ed_logo(), lf=True, ff=True)
        _read_configs()
        env.m4ed_printconf = False
    if env.m4ed_printmain:
        """Shows the 1st level main menu"""
        _mprint(_m4ed_logo(), lf=True, ff=True)
        _mprint("config dir:  %s/" % env.confdir, c="cyan")
        _mprint("baseconfig:  %s" % env.baseconfname, c="cyan")
        _mprint("userconfigs: %s" % env.userconfigs, c="bcyan")
        _has_no_config()
        _mprint("", lf=True)
        _mprint("\t[f] Reload current fabric configs", c="white")
        _mprint("\t[p] Print current combined config data", c="yellow")
        _mprint("\t[u] Select fabric userconfigs to use", c="green")
        _mprint("\t[i] Install things menu", c="blue")
        _mprint("\t[r] Reconfigure services menu", c="bblue")
        _mprint("\t[s] Start/Stop services menu", c="magenta")
        _mprint("")
        _mprint("\t[super] Install everything, restart evereything", c="red")
        _mprint("\t[update] update m4ed, restart m4ed", c="bcyan")
        _mprint("\tExit: %s" % str(quitstrings), c="bblack", ff=True, lf=True)
        sel = prompt("Select: ").lower()
    else:
        _mprint(_m4ed_logo(), lf=True, ff=True)
        sel = prompt("Done, hit enter.").lower()
        env.m4ed_printmain = True
        os.system(['clear', 'cls'][os.name == 'nt'])
        _menu_main()
    if sel in quitstrings:
        exit()
    elif sel == "f":
        _read_configs()
    elif sel == "p":
        _print_current_config()
    elif sel == "u":
        os.system(['clear', 'cls'][os.name == 'nt'])
        env.m4ed_printmain = True
        _menu_config()
    elif sel == "i":
        os.system(['clear', 'cls'][os.name == 'nt'])
        env.m4ed_printmain = True
        _menu_install()
    elif sel == "s":
        env.m4ed_printmain = True
        _menu_control()
    elif sel == "r":
        print "TODO"
    elif sel == "super":
        _read_configs()
        _print_current_config()
        _create_virtualenv()
        if not env.m4ed["virtualenv"]["on_new_install_apts"]:
            _install_apts()
        if not env.m4ed["virtualenv"]["on_new_install_pips"]:
            _install_pips()
        _install_m4ed_codebase()
        _install_node()
        _install_nginx()
        _configure_nginx()
        _install_redis()
        _install_m4ed_worker()
        _install_m4ed_server()
    elif sel == "update":
        _install_m4ed_codebase()
        _install_m4ed_worker()
        _install_m4ed_server()
        _service_cmd("m4ed_asset_worker", "restart")
        _service_cmd("m4ed", "restart")
    elif sel.startswith(":"):
        if sel[1:] == "keys":
            print env.m4ed.keys()
        else:
            print env.m4ed.get(sel[1:], "")
    else:
        env.m4ed_printmain = True
        os.system(['clear', 'cls'][os.name == 'nt'])
        _menu_main()
    env.m4ed_printmain = False
    _menu_main()


def _menu_config():
    """Shows menu for selecting active configs"""
    quitstrings = ("0", "q", "quit", "exit")
    _mprint(_m4ed_logo(), lf=True, ff=True)
    _mprint("Select the userconfigs you wish to use", c="cyan")
    _mprint("(separate numbers with space)", c="cyan", lf=True)
    conffiles = os.listdir(env.confdir)
    confdict = {}
    i = 1
    for file in conffiles:
        if file in env.baseconfname:
            continue
        key = str(i)
        i += 1
        confdict[key] = file
        c = "green" if file in env.userconfigs else "yellow"
        _mprint("\t[%s] %s" % (key, file), c=c)

    _mprint("\tExit: %s" % str(quitstrings), c="bblack", ff=True, lf=True)
    sel = prompt("Select (enter to main menu): ")

    if sel in quitstrings:
        exit()

    if len(sel.strip()) != 0:
        env.userconfigs = ""
        for i in sel:
            if i in confdict:
                env.userconfigs += "%s " % confdict[i]
    env.m4ed_printconf = True
    env.m4ed_printmain = True
    os.system(['clear', 'cls'][os.name == 'nt'])
    _menu_main()


def _menu_install():
    quitstrings = ("0", "q", "quit", "exit")
    if env.m4ed_printmain:
        env.m4ed_printmain = False
        os.system(['clear', 'cls'][os.name == 'nt'])
        _mprint(_m4ed_logo(), lf=True, ff=True)
        if not _has_no_config():
            v = env.m4ed["virtualenv"]
            ve_path = _slash(v["base_path"]) + v["name"]
            ve_user = v["user"]
            repo = env.m4ed["_m4ed_git_repository"]
            branch = env.m4ed["_m4ed_git_source_branch"]
            _mprint("Active virtualenv: %s" % ve_path, c="green")
            _mprint("Active repository: %s" % repo, c="green")
            _mprint("Virtualenv user:   %s" % ve_user, c="green")
            _mprint("Active branch:     %s" % branch, c="green", lf=True)
        _mprint("\t[vi]  install latest m4ed codebase from github")
        _mprint("\t[vu]  update python packages in active virtualenv")
        _mprint("\t[vc]  create new virtualenv with currently active settings")
        _mprint("")
        _mprint("\t[nginx]  install and configure nginx")
        _mprint("\t[nconf]  reconfigure nginx")
        _mprint("\t[redis]  install and configure redis")
        _mprint("\t[rconf]  reconfigure redis")
        _mprint("\t[node]   install and configure node (less needs it)")
        _mprint("")
        _mprint("\t[worker] install and configure m4ed upload worker")
        _mprint("\t[wconf]  reconfigure worker (asset + development)")
        _mprint("\t[m4ed]   install and configure m4ed content server")
        _mprint("\t[compile] compile m4ed (pyramid setup)")
        _mprint("\t[all]    do all the above")
        _mprint("")
        _mprint("\tExit: %s" % str(quitstrings), c="bblack", ff=True, lf=True)
        sel = prompt("Select (enter to main menu): ").lower()
    else:
        _mprint(_m4ed_logo(), lf=True, ff=True)
        sel = prompt("Done, hit enter.").lower()
        env.m4ed_printmain = True
        _menu_install()

    if sel in quitstrings:
        exit()
    elif sel.lower() == "vi":
        _install_m4ed_codebase()
    elif sel.lower() == "vc":
        _create_virtualenv()
    elif sel.lower() == "vu":
        _install_apts()
        _install_pips()
    elif sel.lower() == "nginx":
        _install_nginx()
    elif sel.lower() == "nconf":
        _configure_nginx()
    elif sel.lower() == "redis":
        _install_redis()
    elif sel.lower() == "rconf":
        _configure_redis()
    elif sel.lower() == "worker":
        _install_m4ed_worker()
    elif sel.lower() == "wconf":
        _configure_m4ed_assets()
        _configure_m4ed()
    elif sel.lower() == "compile":
        _compile_m4ed()
    elif sel.lower() == "m4ed":
        _install_m4ed_server()
    elif sel.lower() in ("node", "nodejs", "node.js"):
        _install_node()
    elif sel.startswith(":"):
        if sel[1:] == "keys":
            print env.m4ed.keys()
        else:
            print env.m4ed.get(sel[1:], "")
    else:
        env.m4ed_printmain = True
        os.system(['clear', 'cls'][os.name == 'nt'])
        _menu_main()
    #env.m4ed_printmain = True
    _menu_install()


def _menu_control():
    quitstrings = ("0", "q", "quit", "exit")
    if env.m4ed_printmain:
        env.m4ed_printmain = False
        os.system(['clear', 'cls'][os.name == 'nt'])
        _mprint(_m4ed_logo(), lf=True, ff=True)
        _has_no_config()
        _mprint("", lf=True)
        _mprint("\tnginx:   [1] restart  [nstart] start  [nstop] stop")
        _mprint("\tredis:   [2] restart  [rstart] start  [rstop] stop")
        _mprint("\tmongo:   [3] restart  [mstart] start  [mstop] stop")
        _mprint("\tworker:  [4] restart  [wstart] start  [wstop] stop")
        _mprint("\tm4ed:    [5] restart  [4start] start  [4stop] stop")
        _mprint("", lf=True)
        _mprint("\tn+r+w+4: [8] restart  [sstart] start  [sstop] stop",
                c="bcyan")
        _mprint("\tall:     [9] restart  [astart] start  [astop] stop",
                c="cyan")
        _mprint("")
        _mprint("\tExit: %s" % str(quitstrings), c="bblack", ff=True, lf=True)
        sel = prompt("Select (enter to main menu): ").lower()
    else:
        _mprint(_m4ed_logo(), lf=True, ff=True)
        sel = prompt("Done, pick another or enter for menu: ").lower()
        if sel == "":
            env.m4ed_printmain = True
            _menu_control()

    if sel in quitstrings:
        exit()

    #ngninx
    elif sel.lower() == "1":
        _service_cmd("nginx", "restart")
    elif sel.lower() == "nstart":
        _service_cmd("nginx", "start")
    elif sel.lower() == "nstop":
        _service_cmd("nginx", "stop")

    #redis
    elif sel.lower() == "2":
        _service_cmd("redis", "restart")
    elif sel.lower() == "rstart":
        _service_cmd("redis", "start")
    elif sel.lower() == "rstop":
        _service_cmd("redis", "stop")

    #mongo
    elif sel.lower() == "3":
        _service_cmd("mongo", "restart")
    elif sel.lower() == "mstart":
        _service_cmd("mongo", "start")
    elif sel.lower() == "mstop":
        _service_cmd("mongo", "stop")

    #worker
    elif sel.lower() == "4":
        _service_cmd("m4ed_asset_worker", "restart")
    elif sel.lower() == "wstart":
        _service_cmd("m4ed_asset_worker", "start")
    elif sel.lower() == "wstop":
        _service_cmd("m4ed_asset_worker", "stop")

    #m4ed content server
    elif sel.lower() == "5":
        _service_cmd("m4ed", "restart")
    elif sel.lower() == "4start":
        _service_cmd("m4ed", "start")
    elif sel.lower() == "4stop":
        _service_cmd("m4ed", "stop")

    #all except mongo n+r+w+4
    elif sel.lower() == "8":
         _service_cmd("nginx", "restart")
         _service_cmd("redis", "restart")
         _service_cmd("m4ed_asset_worker", "restart")
         _service_cmd("m4ed", "restart")
    elif sel.lower() == "sstart":
         _service_cmd("nginx", "start")
         _service_cmd("redis", "start")
         _service_cmd("m4ed_asset_worker", "start")
         _service_cmd("m4ed", "start")
    elif sel.lower() == "sstop":
         _service_cmd("nginx", "stop")
         _service_cmd("redis", "stop")
         _service_cmd("m4ed_asset_worker", "stop")
         _service_cmd("m4ed", "stop")

    #all
    elif sel.lower() == "9":
         _service_cmd("nginx", "restart")
         _service_cmd("redis", "restart")
         _service_cmd("mongo", "restart")
         _service_cmd("m4ed_asset_worker", "restart")
         _service_cmd("m4ed", "restart")
    elif sel.lower() == "astart":
         _service_cmd("nginx", "start")
         _service_cmd("redis", "start")
         _service_cmd("mongo", "start")
         _service_cmd("m4ed_asset_worker", "start")
         _service_cmd("m4ed", "start")
    elif sel.lower() == "astop":
         _service_cmd("nginx", "stop")
         _service_cmd("redis", "stop")
         _service_cmd("mongo", "stop")
         _service_cmd("m4ed_asset_worker", "stop")
         _service_cmd("m4ed", "stop")

    elif sel.startswith(":"):
        if sel[1:] == "keys":
            print env.m4ed.keys()
        else:
            print env.m4ed.get(sel[1:], "")
    else:
        env.m4ed_printmain = True
        os.system(['clear', 'cls'][os.name == 'nt'])
        _menu_main()
    _menu_control()

# ----------------------------------------------------------------------------
# Tasks (not available on command line though)
# ----------------------------------------------------------------------------

def _install_m4ed_worker(warn_only=True):
    """configures and installs m4ed upload worker"""
    _mprint("installing m4ed asset worker", ff=True, st="info", c="info")

    if _has_no_config():
        return False

    worker = env.m4ed["m4ed_asset_worker"]
    group = env.m4ed["nginx"]["nginx_user"]
    worker["worker_group"] = group
    # figure out python interpreter path for virtualenv
    worker["worker_python"] = _slash(env.m4ed["virtualenv"]["base_path"]) + \
                              _slash(env.m4ed["virtualenv"]["name"]) + \
                              "bin/python"

    # m4ed conf is created + configured in _configure_m4ed
    conf_type = env.m4ed["m4ed"]["conf_type"]
    worker["worker_config"] = env.m4ed["m4ed"].get("conf_path", "")
    if not worker["worker_config"]:
        target = _slash(env.m4ed["virtualenv"]["base_path"]) + \
                 _slash(env.m4ed["virtualenv"]["name"]) + \
                 _slash(env.m4ed["_m4ed_git_repository"]) + \
                 conf_type + ".ini"
        worker["worker_config"] = target

    # figure out daemon path (init_sbin_path)
    script_src = _slash(env.m4ed["virtualenv"]["base_path"]) + \
                 _slash(env.m4ed["virtualenv"]["name"]) + \
                 _slash(env.m4ed["_m4ed_git_repository"]) + \
                 worker["worker_script"]
    daemon = worker.get("init_sbin_path", "")
    if not daemon:
        worker["init_sbin_path"] = script_src

    _mprint("worker init configuration:", st="info")
    for key in sorted(worker.iterkeys()):
        _mprint("%s: %s" % (key, worker[key]), st="data", c="data")
    _mprint("", ff=True)

    if not console.confirm("Proceed?", default=True):
        _mprint("operation aborted by user", st="fail")
        return False

    with settings(hide('stdout', 'running', 'warnings'),
        warn_only=warn_only):
        sudo("cp %s %s" % (script_src, daemon))
        _mprint("copied daemon to %s" % daemon, st="ok")

    with settings(warn_only=warn_only):
        if worker["create_user"]:
            _mprint("creating worker user: %s" % worker["worker_user"],
                    st="info")
            _add_system_user(worker["worker_user"])
        _mprint("adding worker user to group: %s" % group, st="info")
        _add_user_to_group(worker["worker_user"], group)

    source = worker["worker_init_template"]
    target = worker["init_script_name"]

    _mprint("installing init script to: %s" % target, st="info", ff=True)

    fp = open(source)
    initfile = fp.read()
    fp.close()
    for k, v in worker.items():
        if type(v) in types.StringTypes:
            initfile = initfile.replace("[[%s]]" % k, v)

    with settings(hide('stdout', 'running', 'warnings'), warn_only=warn_only):
        sudo("rm %s" % target)
        sudo("touch %s" % target)
        files.append(target, initfile, use_sudo=True)
        sudo("chmod 755 %s" % target)
        _mprint("installed init script to: %s" % target, st="ok", c="install")
        if target != worker["init_script_link"]:
            sudo("ln -s %s %s" % (target, worker["init_script_link"]))
            _mprint("linked it to: %s" % worker["init_script_link"], st="ok",
                    c="install")

    _configure_m4ed_assets(warn_only=warn_only)
    _configure_m4ed(warn_only=warn_only)

    return True


def _configure_m4ed_assets(warn_only=True):
    """creates and configures the asset.ini for worker"""
    _mprint("configuring m4ed assets", ff=True, st="info", c="info")

    if _has_no_config():
        return False

    asset = env.m4ed["m4ed_asset_worker"]
    asset["worker_log_path"] = _slash(asset["worker_log_path"])

    # fetch the upload_store value from nginx_conf if it's not defined here
    if not asset.get("upload_store", ""):
        asset["upload_store"] = env.m4ed["nginx_conf"]["upload_store"]

    source = asset["asset_template"]
    target = asset.get("assets_conf", "")
    if not target:
        target = _slash(env.m4ed["virtualenv"]["base_path"]) + \
                 _slash(env.m4ed["virtualenv"]["name"]) + \
                 _slash(env.m4ed["_m4ed_git_repository"]) + "assets.ini"
        asset["assets_conf"] = target

    _mprint("creating asset ini into %s" % target, st="info", c="info")

    fp = open(source)
    conffile = fp.read()
    fp.close()
    for k, v in asset.items():
        if type(v) in types.StringTypes:
            conffile = conffile.replace("[[%s]]" % k, v)

    with settings(hide('stdout', 'running', 'warnings'), warn_only=warn_only):
        sudo("rm %s" % target)
        sudo("mkdir -p %s" % target.rsplit("/", 1)[0])
        sudo("touch %s" % target)
        files.append(target, conffile, use_sudo=True)
        sudo("chmod 744 %s" % target)
        user = env.m4ed["m4ed_asset_worker"]["worker_user"]
        if _user_exists(user):
            sudo("chown %s %s" % (user, target))
        else:
            _mprint("no worker user %s exists, run install worker!" % \
                    user, st="fail", c="fail")
        _mprint("installed asset config to: %s" % target, st="ok", c="install")

        _mprint("creating logging directory for worker", st="info")
        sudo("mkdir -p %s" % asset["worker_log_path"])

        if _user_exists(user):
            group = env.m4ed["nginx"]["nginx_user"]
            sudo("chown %s:%s %s" % (asset["worker_user"], group,
                                     asset["worker_log_path"]))
        _mprint("m4ed asset worker log files are in %s" % \
                asset["worker_log_path"], st="ok")

    return True


def _configure_m4ed(warn_only=True):
    """creates and configures the development.ini for m4ed and worker"""
    _mprint("configuring m4ed development.ini", ff=True, st="info", c="info")

    if _has_no_config():
        return False

    dev = env.m4ed["m4ed"]
    source = dev["conf_template"]
    target = dev.get("conf_path", "")
    if not target:
        target = _slash(env.m4ed["virtualenv"]["base_path"]) + \
                 _slash(env.m4ed["virtualenv"]["name"]) + \
                 _slash(env.m4ed["_m4ed_git_repository"]) + \
                 dev["conf_type"] + ".ini"
        dev["conf_path"] = target

    _mprint("creating m4ed config into %s" % target, st="info", c="info")

    # config uses values from: mongo, redis, worker, globals
    dev["mongo_host"] = env.m4ed["mongo"]["mongo_host"]
    dev["mongo_port"] = env.m4ed["mongo"]["mongo_port"]
    dev["mongo_collection_name"] = env.m4ed["mongo"]["mongo_collection_name"]

    dev["redis_port"] = env.m4ed["redis"]["redis_port"]
    dev["redis_db_num"] = env.m4ed["redis"]["redis_db_num"]

    worker = env.m4ed["m4ed_asset_worker"]
    dev["zmq_socket"] = worker["zmq_socket"]
    dev["zmq_worker_socket"] = worker["zmq_worker_socket"]
    dev["zmq_workers"] = worker["zmq_workers"]

    dev["worker_log_level"] = worker["worker_log_level"]
    dev["worker_log_path"] = worker["worker_log_path"]
    dev["worker_log_name"] = worker["worker_log_name"]
    dev["worker_log_size"] = worker["worker_log_size"]
    dev["worker_log_count"] = worker["worker_log_count"]

    assets = env.m4ed["m4ed_asset_worker"]
    assetini_path = assets.get("conf_path", "")
    if not assetini_path:
        assetini_path = _slash(env.m4ed["virtualenv"]["base_path"]) + \
                        _slash(env.m4ed["virtualenv"]["name"]) + \
                        _slash(env.m4ed["_m4ed_git_repository"]) + "assets.ini"
    dev["m4ed_assets_conf_path"] = assetini_path

    fp = open(source)
    conffile = fp.read()
    fp.close()
    for k, v in dev.items():
        if type(v) in types.StringTypes:
            conffile = conffile.replace("[[%s]]" % k, v)


    with settings(hide('stdout', 'running', 'warnings'), warn_only=warn_only):
        sudo("rm %s" % target)
        sudo("mkdir -p %s" % target.rsplit("/", 1)[0])
        sudo("touch %s" % target)
        files.append(target, conffile, use_sudo=True)
        sudo("chmod 744 %s" % target)
        user = dev["m4ed_user"]
        if _user_exists(user):
            sudo("chown %s %s" % (user, target))
        _mprint("installed m4ed config to: %s" % target, st="ok", c="install")

    return True


def _compile_m4ed(warn_only=True):
    """runs setup.py develop for current virtualenv"""
    _mprint("compiling m4ed (pyramid setup)", ff=True, st="info", c="info")

    if _has_no_config():
        return False

    v = env.m4ed["virtualenv"]
    wdir = _slash(v["base_path"]) + _slash(v["name"]) + \
           _slash(env.m4ed["_m4ed_git_repository"])
    _vrun("python setup.py develop", working_dir=wdir)

    # TODO: lessc compile in case uWSGI is used instead of pserve-fanstatic

    return True


def _install_m4ed_server(warn_only=True):
    """configures and installs m4ed content server"""
    _mprint("installing m4ed server", ff=True, st="info", c="info")

    if _has_no_config():
        return False

    # create the /etc/init.d/script
    conf = env.m4ed["m4ed"]
    group = env.m4ed["nginx"]["nginx_user"]
    conf["m4ed_group"] = group
    with settings(hide('warnings', 'stdout', 'running'), warn_only=True):
        conf["lessc_binary"] = str(run("which lessc"))

    # figure out server command
    conf["m4ed_server_cmd"] = _slash(env.m4ed["virtualenv"]["base_path"]) + \
                              _slash(env.m4ed["virtualenv"]["name"]) + \
                              "bin/%s" % conf["m4ed_server_type"]

    # figure out the location of config file
    if not conf.get("conf_path", ""):
        conf["conf_path"] = _slash(env.m4ed["virtualenv"]["base_path"]) + \
                            _slash(env.m4ed["virtualenv"]["name"]) + \
                            _slash(env.m4ed["_m4ed_git_repository"]) + \
                            conf["conf_type"] + ".ini"


    _mprint("m4ed server init configuration:", st="info")
    for key in sorted(conf.iterkeys()):
        _mprint("%s: %s" % (key, conf[key]), st="data", c="data")
    _mprint("", ff=True)

    if not console.confirm("Proceed?", default=True):
        _mprint("operation aborted by user", st="fail")
        return False

    with settings(warn_only=warn_only):
        if conf["create_user"]:
            _mprint("creating m4ed user: %s" % conf["m4ed_user"], st="info")
            _add_system_user(conf["m4ed_user"])
        _mprint("adding m4ed user to group: %s" % group, st="info")
        _add_user_to_group(conf["m4ed_user"], group)

    source = conf["init_template"]
    target = conf["init_script_name"]

    _mprint("installing init script to: %s" % target, st="info", ff=True)

    fp = open(source)
    initfile = fp.read()
    fp.close()
    for k, v in conf.items():
        if type(v) in types.StringTypes:
            initfile = initfile.replace("[[%s]]" % k, v)

    with settings(hide('stdout', 'running', 'warnings'), warn_only=warn_only):
        sudo("rm %s" % target)
        sudo("touch %s" % target)
        files.append(target, initfile, use_sudo=True)
        sudo("chmod 755 %s" % target)
        _mprint("installed init script to: %s" % target, st="ok", c="install")
        if target != conf["init_script_link"]:
            sudo("ln -s %s %s" % (target, conf["init_script_link"]))
            _mprint("linked it to: %s" % conf["init_script_link"], st="ok",
                    c="install")
        if "fanstatic" in conf["m4ed_server_type"]:
            #lessc fix
            _mprint("fix the lessc environment bug for fanstatic", st="info")
            lesscfile = "/usr/local/bin/lessc"
            origfile = "/usr/local/lib/node_modules/less/bin/lessc"
            sudo("sed -i 's/usr\/bin\/env node/usr\/local\/bin\/node/g' %s" % \
                 origfile)
            sudo("rm -f %s" % lesscfile)
            sudo("ln -s  %s %s" % (origfile, lesscfile))

    _compile_m4ed()

    return True



def _install_m4ed_codebase():
    """
    Installs m4ed codebase in currently active virtualenv

    Removes the existing codebase entirely. Pulls latest version from
    github, and re-configures the service.

    """
    _mprint("Updating m4ed codebase", ff=True, st="info", c="info")

    if _has_no_config():
        return False

    v = env.m4ed["virtualenv"]
    git_https = env.m4ed["_m4ed_git_https"]
    git_repo = env.m4ed["_m4ed_git_repository"]
    git_bsrc = env.m4ed["_m4ed_git_source_branch"]
    git_bdst = env.m4ed["_m4ed_git_checkout_branch"]

    if not _user_exists(v["user"]):
        _mprint("No user: %s in host %s" % (v["user"], env.host), st="fail")
        return False

    ve_base = _slash(v["base_path"])
    ve_name = _slash(v["name"])
    ve_path = ve_base + ve_name
    gitpath = ve_path + git_repo

    if not files.exists(ve_path, use_sudo=True):
        _mprint("No path: %s, create virtualenv first!" % ve_path, st="fail")
        return False

    with settings(hide('warnings', 'stdout', 'running'), warn_only=True):
        while files.exists(gitpath, use_sudo=True):
            _mprint("Existing repository at: %s" % gitpath, st="info")
            _mprint("IT WILL BE DELETED BEFORE NEW CODEBASE IS FETCHED!",
                    st="info")

            # double check the confirmation for deletion
            dtroy1 = "\033[31m\033[5mALLOW DELETING IT?\033[0m"
            dtroy2 = "ENTIRE SUBTREE OF %s WILL BE DELETED!" % gitpath
            dtroy3 = "\033[31mARE YOU ABSOLUTELY SURE!?\033[0m"
            if console.confirm(dtroy1, default=False):
                _mprint(dtroy2, st="info")
                if console.confirm(dtroy3, default=False):
                    # delete the repository
                    _mprint("Annihilating repository: %s" % gitpath,
                            st="info")
                    sudo("rm -rf %s" % gitpath)
            else:
                _mprint("repositories at %s" % ve_path, st="info",
                        lf=True, ff=True)
                _print_dirs(ve_path)
                _mprint("", lf=True)

                # prompt forever for new name
                git_repo = _sanitize(prompt("Name for new repository: "))
                if git_repo == "":
                    _mprint("User aborted the process", st="fail")
                    return False
                gitpath = ve_path + git_repo
                env.m4ed["_m4ed_git_repository"] = git_repo
    _mprint("Clone and checkout", title=True, ff=True, c="magenta", st="info")
    _vrun("git clone %s %s" % (git_https, git_repo), ve_path=ve_path,
           user=v["user"])

    if git_bsrc not in ("origin/master", "master") or git_bdst != "master":
        print git_bsrc
        print git_bdst
        cmd = "--git-dir=%s/.git --work-tree=%s" % (gitpath, gitpath)
        git_orig = "" if git_bsrc.startswith("origin/") else "origin/"
        _vrun("git %s checkout %s%s -b %s" % \
             (cmd, git_orig, git_bsrc, git_bdst), ve_path=ve_path,
             user=v["user"])

    return True


def _create_virtualenv():
    """
    Creates new empty virtualenv

    Downloads virtualenv.py always to script_tmp and deletes existing
    virtualenv.py from that dir. Includes double check to trash old
    virtualenvs if user wants to overwrite existing virtualenvs

    All parameters are read from configs (env.m4ed dictionary)

    """

    _mprint("Creating new virtualenv", ff=True, st="info", c="info")

    if _has_no_config():
        return False

    v = env.m4ed["virtualenv"]

    if not _user_exists(v["user"]):
        _mprint("No user: %s in host %s" % (v["user"], env.host), st="fail")
        return False

    tmp = _slash(v["script_tmp"])
    with settings(hide('warnings', 'stdout', 'running'), warn_only=True):
        pkgdata = _get_pkgdata(v["script_src"])
        with cd(tmp):
            _mprint("Fetching %s into %s" % (pkgdata["dir"], tmp), st="info")
            sudo("rm %s" % pkgdata["dir"])
            sudo(pkgdata["cmd"])

            ve_base = _slash(v["base_path"])
            if not files.exists(ve_base, use_sudo=True):
                sudo("mkdir -p %s" % ve_base)

            ve_path = ve_base + v["name"]

            _mprint("Creating virtualenv to: %s" % ve_path, st="info")
            while files.exists(ve_path, use_sudo=True):
                _mprint("Existing virtualenv at: %s" % ve_path, st="fail")

                # double check the confirmation for deletion
                dtroy1 = "\033[31m\033[5mDESTROY IT COMPLETELY?\033[0m"
                dtroy2 = "ENTIRE SUBTREE OF %s WILL BE DELETED!" % ve_path
                dtroy3 = "\033[31mARE YOU ABSOLUTELY SURE!?\033[0m"
                if console.confirm(dtroy1, default=False):
                    _mprint(dtroy2, st="info")
                    if console.confirm(dtroy3, default=False):
                        # delete the virtualenv
                        _mprint("Annihilating virtualenv: %s" % ve_path,
                                st="info")
                        sudo("rm -rf %s" % ve_path)

                else:

                    _mprint("Virtualenvs at %s" % ve_base, st="info",
                            lf=True, ff=True)
                    _print_dirs(ve_base)
                    _mprint("", lf=True)

                    # prompt forever for new name
                    v["name"] = _sanitize(prompt("Name for new virtualenv: "))
                    if v["name"] == "":
                        _mprint("User aborted the process", st="fail")
                        return False
                    ve_path = ve_base + v["name"]
                    env.m4ed["virtualenv"]["name"] = v["name"]

            _mprint("Creating virtualenv: %s" % ve_path, st="info")

            sudo("chown %s %s" % (v["user"], ve_base))
            sudo("python2.7 %s %s" % (pkgdata["dir"], ve_path), user=v["user"])

            _mprint("Virtualenv created.", st="ok")

    if v["on_new_install_apts"]:
        _install_apts()

    if v["on_new_install_pips"]:
        _install_pips()

    return True


def _configure_nginx(warn_only=True):
    """Configures / reconfigures nginx"""

    _mprint("Configuring nginx", ff=True, st="info", c="info")

    if _has_no_config():
        return False

    nginx = env.m4ed.get("nginx", {})
    nginx["init_conf_imports"] = _slash(nginx["init_conf_imports"])

    _mprint("nginx configuration:", st="info")
    for key in sorted(nginx.iterkeys()):
        _mprint("%s: %s" % (key, nginx[key]), st="data", c="data")
    _mprint("", lf=True)

    nginx_conf = env.m4ed["nginx_conf"]
    _mprint("nginx main config:", st="info")
    for key in sorted(nginx_conf.iterkeys()):
       _mprint("%s: %s" % (key, nginx_conf[key]), st="data", c="data")
    _mprint("", lf=True)

    for i in nginx.get("imported_configs", []):
        _mprint("imported config %s:" % i, st="info")
        k = env.m4ed.get(i, {})
        for key in sorted(k.iterkeys()):
            _mprint("\t%s: %s" % (key, k[key]), st="data", c="data")
        _mprint("", lf=True)

    m = "\033[31m\033[5mTHESE ACTIONS ARE PERFORMED ON TARGET HOST:\033[0m"
    _mprint("%s" % m, st="info")
    _mprint("overwrite contents of %s" % nginx["init_conf_path"],
            c="bcyan", st="info")
    _mprint("trash contents of %s" % nginx["init_conf_imports"],
            c="bcyan", st="info")
    for i in nginx.get("imported_configs", []):
        _mprint("create %s%s.%s" % (nginx["init_conf_imports"],
                i, nginx["init_conf_extension"]), c="bcyan", st="info")
    _mprint("", lf=True)

    if not console.confirm("Do you want to proceed?"):
        return False

    conf = dict(nginx)
    conf.update(nginx_conf)

    # nginx.conf
    # overwrite contents of conf["init_conf_path"]
    # use conf["nginx_conf"] to replace with conf["main_conf_template"]
    # write conf["init_conf_path"]
    # make user access rights to it for conf[nginx_user]

    _make_nginx_tmp_dirs(conf)

    source = conf["main_conf_template"]
    target = conf["init_conf_path"]
    user = conf["nginx_user"]
    _mprint("creating config: %s from %s" % (target, source), st="info")
    fp = open(conf["main_conf_template"])
    conffile = fp.read()
    fp.close()
    for k, v in conf.items():
        if type(v) in types.StringTypes:
            conffile = conffile.replace("[[%s]]" % k, v)

    with settings(hide('stdout', 'running', 'warnings'), warn_only=warn_only):
        sudo("rm %s" % target)
        sudo("touch %s" % target)
        files.append(target, conffile, use_sudo=True)
        sudo("chmod 744 %s" % target)
        sudo("chown %s:%s %s" %(user, user, target))
        _mprint("installed main config to: %s" % target, st="ok", c="install")

    # get nginx_user from main, merge new config to that.
    # get also imported_configs from main, merge new config to that
    # additional configs
    # trash conf["init_conf_imports"]
    # replace contents of conf["imported_configs"] with env.m4ed["confname"]
    # write conf["init_conf_imports"]/confname.conf["init_conf_extension"]
    #

    target_path = _slash(conf["init_conf_imports"])
    extension = conf["init_conf_extension"]
    with settings(hide('stdout', 'running', 'warnings'), warn_only=True):
        sudo("mkdir -p %s" % target_path)
        sudo("rm -rf %s*" % target_path)
        sudo("chown %s:%s %s" % (user, user, target_path))
        sudo("chmod 775 %s" % target_path)
        _mprint("cleaned: %s" % target_path, st="ok", c="info")

    origconf = dict(conf)
    for c in nginx.get("imported_configs", []):
        conf = dict(origconf)
        conf.update(env.m4ed.get(c, {}))
        source = conf["conf_template"]
        target = "%s%s.%s" % (target_path, conf["target_name"], extension)
        _mprint("creating config: %s from %s" % (target, source), st="info")
        _make_nginx_tmp_dirs(conf)
        fp = open(source)
        conffile = fp.read()
        fp.close()
        for k, v in conf.items():
            if type(v) in types.StringTypes:
                conffile = conffile.replace("[[%s]]" % k, v)

        with settings(hide('stdout', 'running', 'warnings'),
             warn_only=warn_only):
            sudo("rm %s" % target)
            sudo("touch %s" % target)
            files.append(target, conffile, use_sudo=True)
            sudo("chmod 744 %s" % target)
            sudo("chown %s:%s %s" %(user, user, target))
            _mprint("installed config to: %s" % target, st="ok", c="install")


    return True

def _make_nginx_tmp_dirs(conf):
    """Creates temporary directories required by nginx"""

    # create nginx upload tmp dirs
    if conf.get("nginx_create_upload_dirs", False):
        user = conf["nginx_user"]
        _mprint("upload directive found!", st="info", ff=True)
        _mprint("creating nginx tmp upload directories", st="info", c="info")
        # TODO: logic for other hashes!
        if conf["upload_hash"] == "1":
            path = conf["upload_store"]
            tmpdirs = [_slash(path) + str(x) for x in range(0, 10)]
            _mprint("Specified temp dirs:", st="info")
            for i in tmpdirs:
                _mprint("\t%s" % i, st="info")
            _mprint("", lf=True)
            if console.confirm("create / clear temp dirs listed above?",
                               default=True):
                with settings(hide('stdout', 'running'), warn_only=True):
                    for i in tmpdirs:
                        sudo("mkdir -p %s" % i)
                        sudo("rm -rf %s/*" % i)
                        sudo("chown %s:%s %s" % (user, user, i))
                        sudo("chmod 775 %s" % i)
                        _mprint("created: %s" % i, st="ok", c="install")

            else:
                _mprint("temp dir creation aborted by user", st="ok",
                        c="cyan", lf=True)
                return False


        else:
            _mprint("unsupported hash value, no directories created!",
                    st="fail", lf=True)
            return False

    # create nginx tmp dirs
    if conf.get("create_tmp_http_dirs", False):
        _mprint("creating nginx tmp http directories", st="info", c="info")
        keys = ["tmp_http_client",
                "tmp_http_proxy",
                "tmp_http_fastcgi",
                "tmp_http_uwsgi",
                "tmp_http_scgi",]
        for key in keys:
            path = conf[key]
            if files.exists(path, use_sudo=True):
                _mprint("%s exists, good" % path, st="ok", c="bblack")

            else:
                _mprint("%s doesn't exist, creating it" % path, st="info",
                        c="install")
                with settings(hide('stdout', 'running', 'warnings'),
                    warn_only=True):
                    sudo("mkdir -p %s" % path)

    return True


def _install_nginx(warn_only=True):
    """Downloads, compiles and installs the nginx server on remote host"""

    _mprint("Downloading and installing nginx", ff=True, st="info", c="info")
    if _has_no_config():
        return False

    nginx = env.m4ed.get("nginx", {})

    _mprint("nginx configuration:", st="info")
    for key in sorted(nginx.iterkeys()):
        _mprint("%s: %s" % (key, nginx[key]), st="data", c="data")
    _mprint("", ff=True)

    # create user and prepare /tmp/nginx <- due to rm -rf this is hardcoded!
    hc_tmp = "/tmp/nginx"  # CAUTION!! rm -rf executed to this!

    if not console.confirm("Proceed?", default=True):
        _mprint("operation aborted by user", st="fail")
        return False

    with settings(warn_only=warn_only):
        if nginx["create_user"]:
            _add_system_user(nginx["nginx_user"])

        if not console.confirm("destroy %s?" % hc_tmp, default=True):
            _mprint("operation aborted", st="fail", c="green")
            return False

        sudo("rm -rf %s" % hc_tmp)
        sudo("mkdir -p %s" % hc_tmp)

    # prepare compile options
    options = ['--prefix="/"',
               '--sbin-path="%s"' % nginx["init_sbin_path"],
               '--conf-path="%s"' % nginx["init_conf_path"],
               '--pid-path="%s"' % nginx["init_pid_path"],
               '--error-log-path="%s"' % nginx["error_logs"],
               '--http-log-path="%s"' % nginx["http_logs"],
               '--user=%s' % nginx["nginx_user"],
               '--group=%s' % nginx["nginx_user"],
               '--http-client-body-temp-path=%s' % nginx["tmp_http_client"],
               '--http-proxy-temp-path=%s' % nginx["tmp_http_proxy"],
               '--http-fastcgi-temp-path=%s' % nginx["tmp_http_fastcgi"],
               '--http-uwsgi-temp-path=%s' % nginx["tmp_http_uwsgi"],
               '--http-scgi-temp-path=%s' % nginx["tmp_http_scgi"]]


    # fetch modules and add to compile options
    with settings(warn_only=warn_only):
        with cd(hc_tmp):
            for m in nginx.get("with_modules", []):
                pkgdata = _get_pkgdata(m)
                sudo(pkgdata["cmd"])
                options.append('--add-module="../%s"' % pkgdata["dir"])

    # pcre module and compile option
    with settings(warn_only=warn_only):
        with cd(hc_tmp):
            pcre_path = nginx.get("pcre_path", False)
            if pcre_path:
                pkgdata = _get_pkgdata(pcre_path)
                sudo(pkgdata["cmd"])
                options.append('--with-pcre="../%s"' % pkgdata["dir"])

    # ssl support
    if nginx["with_ssl_module"]:
        options.append('--with-http_ssl_module')

    # auxiliary options
    if nginx.get("auxiliary_options", False):
        options.append(nginx["auxiliary_options"])

    # configure and install nginx
    with settings(warn_only=warn_only):
        pkgdata = _get_pkgdata(nginx["nginx_package"])
        with cd(hc_tmp):
            sudo(pkgdata["cmd"])
        with cd("%s/%s" % (hc_tmp, pkgdata["dir"])):
            sudo("./configure " + string.join(options, " "))
            sudo("make -j4")
            sudo("make install")

    _mprint("installed nginx to: %s" % nginx["init_sbin_path"], st="ok")

    # manipulate nginx initfile template and create the target init script
    init_script = nginx["init_script_name"]
    _mprint("installing init script to: %s" % init_script, st="info",
            ff=True)

    fp = open(nginx["init_template"])
    initfile = fp.read()
    fp.close()
    for k, v in nginx.items():
        if type(v) in types.StringTypes:
            initfile = initfile.replace("[[%s]]" % k, v)

    if files.exists(init_script, use_sudo=True):
        hc_bu = hc_tmp + "/nginx_init_backup"
        with settings(hide('stdout', 'running'),
                      warn_only=warn_only):
            sudo("cp %s %s" % (init_script, hc_bu))
        _mprint("copied %s > %s" % (init_script, hc_bu), st="info", c="blue")

    with settings(hide('stdout', 'running'), warn_only=warn_only):
        sudo("rm %s" % init_script)
        sudo("touch %s" % init_script)
        files.append(init_script, initfile, use_sudo=True)
        sudo("chmod 755 %s" % init_script)
        _mprint("installed init script to: %s" % init_script, st="ok",
                c="install")
        if init_script != nginx["init_script_link"]:
            sudo("ln -s %s %s" % (init_script, nginx["init_script_link"]))
            _mprint("linked it to: %s" % nginx["init_script_link"], st="ok",
                    c="install")

    return _configure_nginx(warn_only=warn_only)


def _install_redis(warn_only=True):
    """Downloads, compiles, installs and configures redis on remote host"""

    _mprint("Downloading and installing redis", ff=True, st="info", c="info")
    if _has_no_config():
        return False

    redis = env.m4ed.get("redis", {})
    redis["log_dir"] = _slash(redis["log_dir"])

    _mprint("redis configuration:", st="info")
    for key in sorted(redis.iterkeys()):
        _mprint("%s: %s" % (key, redis[key]), st="data", c="data")
    _mprint("", ff=True)

    # create user and prepare /tmp/redis <- due to rm -rf this is hardcoded!
    hc_tmp = "/tmp/redis"  # CAUTION!! rm -rf executed to this!

    if not console.confirm("Proceed?", default=True):
        _mprint("operation aborted by user", st="fail")
        return False

    with settings(warn_only=warn_only):
        if redis["create_user"]:
            _add_system_user(redis["redis_user"])

        if not console.confirm("destroy %s?" % hc_tmp, default=True):
            _mprint("operation aborted", st="fail", c="green")
            return False

        sudo("rm -rf %s" % hc_tmp)
        sudo("mkdir -p %s" % hc_tmp)

    # configure and install redis
    with settings(warn_only=warn_only):
        pkgdata = _get_pkgdata(redis["redis_package"])
        with cd(hc_tmp):
            sudo(pkgdata["cmd"])
        with cd("%s/%s" % (hc_tmp, pkgdata["dir"])):
            sudo("make")
            with cd("src"):
                with settings(hide('stdout', 'running'), warn_only=warn_only):
                    _mprint("installing redis sbin targets to: %s" % \
                             redis["init_sbin_path"], st="info")
                    for i in redis["redis_sbin_targets"]:
                        sudo("mv %s %s" % (i, redis["init_sbin_path"]))
                        _mprint("installed %s" % i, st="ok", c="install")

                    _mprint("installing redis usrbin targets to: %s" % \
                            redis["init_usrbin_path"], st="info")
                    for i in redis["redis_usrbin_targets"]:
                        sudo("mv %s %s" % (i, redis["init_usrbin_path"]))
                        _mprint("installed %s" % i, st="ok", c="install")

    # manipulate redis initfile template and create the target init script
    init_script = redis["init_script_name"]
    _mprint("installing init script to: %s" % init_script, st="info",
            ff=True)

    fp = open(redis["init_template"])
    initfile = fp.read()
    fp.close()
    for k, v in redis.items():
        if type(v) in types.StringTypes:
            initfile = initfile.replace("[[%s]]" % k, v)

    if files.exists(init_script, use_sudo=True):
        hc_bu = hc_tmp + "/redis_init_backup"
        with settings(hide('stdout', 'running'),
                      warn_only=warn_only):
            sudo("cp %s %s" % (init_script, hc_bu))
        _mprint("copied %s > %s" % (init_script, hc_bu), st="info", c="blue")

    with settings(hide('stdout', 'running'), warn_only=warn_only):
        sudo("rm %s" % init_script)
        sudo("touch %s" % init_script)
        files.append(init_script, initfile, use_sudo=True)
        sudo("chmod 755 %s" % init_script)
        _mprint("installed init script to: %s" % init_script, st="ok")
        if init_script != redis["init_script_link"]:
            sudo("ln -s %s %s" % (init_script, redis["init_script_link"]))
            _mprint("linked it to: %s" % redis["init_script_link"], st="ok")

        _mprint("creating logfile and redisdump directories", st="info")
        sudo("mkdir -p %s" % redis["log_dir"])
        sudo("chown %s %s" % (redis["redis_user"], redis["log_dir"]))
        _mprint("redis log files are in %s" % redis["log_dir"], st="ok")

        sudo("mkdir -p %s" % redis["dump_dir"])
        sudo("chown %s %s" % (redis["redis_user"], redis["dump_dir"]))
        _mprint("redis dump files are in %s" % redis["dump_dir"], st="ok")

    return _configure_redis(warn_only=warn_only)


def _configure_redis(warn_only=True):
    """Configures / reconfigures redis"""

    _mprint("configuring redis", ff=True, st="info", c="info")

    if _has_no_config():
        return False

    conf = env.m4ed.get("redis", {})
    conf["log_dir"] = _slash(conf["log_dir"])

    _mprint("redis configuration:", st="info")
    for key in sorted(conf.iterkeys()):
        _mprint("%s: %s" % (key, conf[key]), st="data", c="data")
    _mprint("", lf=True)

    m = "\033[31m\033[5mTHESE ACTIONS ARE PERFORMED ON TARGET HOST:\033[0m"
    _mprint("%s" % m, st="info")
    _mprint("overwrite contents of %s" % conf["init_conf_path"],
            c="bcyan", st="info")

    if not console.confirm("Do you want to proceed?"):
        return False

    source = conf["main_conf_template"]
    target = conf["init_conf_path"]
    user = conf["redis_user"]
    _mprint("creating config: %s from %s" % (target, source), st="info")
    fp = open(conf["main_conf_template"])
    conffile = fp.read()
    fp.close()
    for k, v in conf.items():
        if type(v) in types.StringTypes:
            conffile = conffile.replace("[[%s]]" % k, v)

    with settings(hide('stdout', 'running', 'warnings'), warn_only=warn_only):
        sudo("rm %s" % target)
        sudo("touch %s" % target)
        files.append(target, conffile, use_sudo=True)
        sudo("chmod 744 %s" % target)
        sudo("chown %s:%s %s" %(user, user, target))
        _mprint("installed main config to: %s" % target, st="ok", c="install")

    return True


def _install_node(warn_only=True):
    """
    Downloads, compiles, installs node on the remote host

    *required for less and r.js*
    node.js (globally)
    with npm (globally): requirejs, less

    """

    _mprint("Downloading and installing node.js", ff=True, st="info", c="info")
    if _has_no_config():
        return False

    nodejs = env.m4ed.get("nodejs", {})

    _mprint("nodejs configuration:", st="info")
    for key in sorted(nodejs.iterkeys()):
        _mprint("%s: %s" % (key, nodejs[key]), st="data", c="data")
    _mprint("", ff=True)

    _print_node_version()
    if console.confirm("Install latest node.js?", default=False):
        # prepare /tmp/nodejs <- due to rm -rf this is hardcoded!
        hc_tmp = "/tmp/nodejs"  # CAUTION!! rm -rf executed to this!

        if not console.confirm("Proceed?", default=True):
            _mprint("operation aborted by user", st="fail")
            return False

        with settings(warn_only=warn_only):
            if not console.confirm("destroy %s?" % hc_tmp, default=True):
                _mprint("operation aborted", st="fail", c="green")
                return False

            sudo("rm -rf %s" % hc_tmp)
            sudo("mkdir -p %s" % hc_tmp)

        with settings(hide('warnings', 'stdout', 'running'), warn_only=True):
            pkgdata = _get_pkgdata(nodejs["nodejs_package"])
            with cd(hc_tmp):
                _mprint("fetching latest nodejs source", c="info", st="info")
                sudo(pkgdata["cmd"])
                with cd("%s/%s" % (hc_tmp, pkgdata["dir"])):
                    _mprint("configuring nodejs install", c="info", st="info")
                    sudo("./configure")
                    _mprint("building nodejs install", c="info", st="info")
                    sudo("make")
                    _mprint("installing nodejs", c="install", st="info")
                    sudo("make install")
            _print_node_version()

    _mprint("Installing dependencies with npm", st="info", ff=True, c="info")
    with settings(hide('warnings', 'stdout', 'running'), warn_only=True):
        for i in nodejs["npm_installs"]:
            ret = sudo("npm -g ls %s" % i).decode("utf-8")
            _mprint("current version of %s is:" % i, st="info")
            _mprint("%s" % ret, c="install", st="info", lf=True)
            if console.confirm("Install/Update %s" % i, default=False):
                sudo("npm -g install %s" % i)
                sudo("npm -g update %s" % i)
                ret = sudo("npm -g ls %s" % i).decode("utf-8")
                _mprint("current version of %s is now:" % i, c="info", st="ok")
                _mprint("%s" % ret, c="ok", st="ok", lf=True)


    return True


# ----------------------------------------------------------------------------
# Internal helper functions
# ----------------------------------------------------------------------------

def _print_all_service_leds(visible=True):
    services = (("nginx", "nginx"),
                ("redis", "redis"),
                ("mongo", "mongo"),
                ("m4ed_asset_worker", "worker"),
                ("m4ed", "m4ed"))

    row = ""
    for service in services:
        led = _service_cmd(service[0], "status", silent=True)
        if led:
            row += "\033[32m%s \033[42m \033[0m  " % (service[1])
        else:
            row += "\033[31m\033[5m%s \033[41m \033[0m  " % (service[1])

    if visible:
        _mprint(row)
    return row


def _service_cmd(service, cmd, silent=False):
    """issue commands to installed services via init scripts"""
    # track the initscript "nginx", "redis", "mongo", "m4ed_asset_worker",
    # "m4ed"

    service = service.lower()
    if env.m4ed[service]["init_script_link"]:
        initscript = env.m4ed[service]["init_script_link"]
    else:
        initscript = env.m4ed[service]["init_script_name"]

    cmd = cmd.lower()
    with settings(hide('warnings', 'running', 'stdout'), warn_only=True):
        if cmd != "status":
            _mprint("issuing %s on %s" % (cmd, initscript), st="info", c="info",
                    silent=silent)
            sudo("%s %s" % (initscript, cmd), pty=False)
        status = sudo("%s status" % initscript)
        if ("not running" in status.lower()) or ("failed" in status.lower()):
            _mprint("%s is not running" % service, st="fail", c="fail",
                    silent=silent)
            return False
        else:
            _mprint("%s is running" % service, st="ok", c="ok", silent=silent)
            return True


# IMPLEMENT
def _tail_logs(filenames, numlines):
    """tails given filenames and pretties the output"""
    # try to parse for errors (mark them red) etc.
    return ""


def _install_apts():
    """Installs packages that are required by pip installs with aptitude"""

    _mprint("Installing dependencies with aptitude", c="info", st="info")
    if _has_no_config():
        return False

    for i in env.m4ed["virtualenv"]["aptitude_installs"]:
        _mprint("Installing %s" % i, c="install", st="info")
        sudo("aptitude install %s" % i)

    _mprint("Installation of required dependencies finished", st="ok")
    return True


def _install_pips():
    """installs m4ed dependencies with pip into given virtualenv"""
    # TODO pyCAPTCHA MUST BE INSTALLED MANUALLY!!!
    # TODO pyCAPTCHA MUST BE INSTALLED MANUALLY!!!
    # TODO pyCAPTCHA MUST BE INSTALLED MANUALLY!!!

    _mprint("Installing python packages to virtualenv using pip",
            c="info", st="info")
    if _has_no_config():
        return False

    v = env.m4ed["virtualenv"]
    ve_base = _slash(v["base_path"])
    ve_name = v["name"]
    ve_path = ve_base + ve_name
    _mprint("Using virtualenv: %s" % ve_path, st="info")

    if not files.exists(ve_path, use_sudo=True):
        _mprint("No such virtualenv: %s, create it first!" % ve_path,
                st="fail")
        return False

    all_ok = True
    with settings(hide('warnings', 'stdout', 'running'), warn_only=True):
        cmd = "pip install --upgrade" if v["pip_upgrade"] else "pip install"
        for i in v["pip_installs"]:
            _mprint("Installing %s" % i, c="install", st="info")
            _vrun("%s %s" % (cmd, i), ve_path=ve_path, user=v["user"],
                  pty=False)
            if "/" in i:
                i = _get_pkgdata(i)["dir"]
            i = i.replace("_", "-") + "="
            ret = _vrun("pip freeze | grep -i %s" % i, ve_path=ve_path,
                        user=v["user"], pty=False)
            if i.lower() in ret.lower():
                _mprint("%s installed" % ret, c="ok", st="ok")
            else:
                _mprint("Installation of %s failed!" % i, st="fail")
                all_ok = False
    _mprint("Current pip installations:", title=True, lf=True, ff=True)
    _vrun("pip freeze", ve_path=ve_path, user=v["user"], pty=False)
    _mprint("", footer=True, lf=True)
    if all_ok:
        _mprint("All packages installed successfully", st="ok")
    else:
        _mprint("OOPS!! Not all packages were installed", st="fail", c="bred")

    return True


def _sanitize(input):
    """
    Strips unwanted control characters from input values
    Authors: Chase Seibert, Max Harper

    """

    if not input:
        return input

    # unicode invalid characters
    re_xml = u'([\u0000-\u0008\u000b-\u000c\u000e-\u001f\ufffe-\uffff])' + \
             u'|' + \
             u'([%s-%s][^%s-%s])|([^%s-%s][%s-%s])|([%s-%s]$)|(^[%s-%s])' % \
             (unichr(0xd800), unichr(0xdbff), unichr(0xdc00), unichr(0xdfff),
              unichr(0xd800), unichr(0xdbff), unichr(0xdc00), unichr(0xdfff),
              unichr(0xd800), unichr(0xdbff), unichr(0xdc00), unichr(0xdfff))
    input = re.sub(re_xml, "", input)
    input = re.sub(r"[\x01-\x1F\x7F]", "", input)
    return input


def _print_dirs(path):
    """pretty prints dirs in given path"""
    with settings(hide('warnings', 'stdout', 'running'), warn_only=True):
        with cd(path):
            ret = run("ls -1 -d */")
            for i in ret.split("\n"):
                _mprint("\t %s" % i[:-1], c="bred")


def _user_exists(user):
    with settings(hide('stdout', 'running', 'warnings'), warn_only=True):
        return "No such user" not in sudo("id %s" % user)


def _print_node_version():
    """Checks for node's version and install status"""
    with settings(hide('warnings', 'stdout', 'running'), warn_only=True):
        stat = run("node -v")
        _mprint("currently installed version of node.js: " + stat,
                c="info", st="ok")


def _m4ed_logo():
    w = (70 - len(env.host) - len("host: ")) / 3
    ret = "\033[42m\033[97m m4 \033[47m\033[32m ed \033[0m-\033[100m" + \
           " " * w + "\033[37mhost:%s " % env.host + " " * 2 * w + "\033[0m"
    ret += "\n"
    ret += "          " + _print_all_service_leds(visible=False)

    ret = "\033[42m\033[97m m4 \033[47m\033[32m ed \033[0m-\033[100m"
    ret += " \033[37mhost:%s \033[0m  " % env.host
    ret += _print_all_service_leds(visible=False)
    ret += "\033[100m  \033[0m"

    return ret

def _slash(path):
    """Ensures that paths end with slash"""
    if not path.endswith("/"):
        path += "/"
    return path


def _vrun(cmd, ve_path="", working_dir="", user="", pty=True, silent=False):
    """
    Runs commands in virtulenv contexts

    Arguments:
        cmd - the command that is run in virtualenv context

    Keyword arguments:
        ve_path  -- ("") path where bin/activate can be reached
        working_dir -- ("") path where command is run, defaults to ve_path
        user -- ("") username who runs the command in virtualenv context
        pty -- (True) on True, a pseudo-terminal is created (more secure)
        silent -- (False) on True hides warnings, stdout, and running

    """
    act = "bin/activate"
    v = env.m4ed["virtualenv"]
    if not ve_path:
        ve_path = _slash(v["base_path"]) + v["name"]
    if not working_dir:
        working_dir = ve_path
    if not user:
        user = v["user"]

    with cd(working_dir):
        if silent:
            with settings(hide('warnings', 'stdout', 'running'),
                          warn_only=True):
                return sudo("source %s/%s" % (ve_path, act) + '&&' + cmd,
                            user=user, pty=pty)
        else:
            return sudo("source %s/%s" % (ve_path, act) + '&&' + cmd,
                         user=user, pty=pty)

def _read_configs():
    """Reads config files and updates env.m4ed dictionary accordingly"""

    _mprint("Reading and updating fab configs from %s/" % env.confdir,
            ff=True, st="info", c="info")
    baseconfig = env.confdir + "/" + env.baseconfname
    userconfigs = env.userconfigs
    if type(userconfigs) in types.StringTypes:
        userconfigs = userconfigs.split()

    try:
        fp = open(baseconfig)
        _mprint("Baseconfig: %s" % env.baseconfname, st="ok", c="ok")
        baseconfig = fp.read()
        fp.close()
        baseconfig = _json_minify(baseconfig)
        env.m4ed = json.loads(baseconfig)

        # merge user configs to baseconfig

        for userconfig in userconfigs:
            fp = open(env.confdir + "/" + userconfig)
            _mprint("Userconfig: %s" % userconfig, st="ok", c="ok")
            userconfig = fp.read()
            fp.close()
            userconfig = _json_minify(userconfig)
            userconfig = json.loads(userconfig)
            for k, v in userconfig.items():
                if k in env.m4ed:
                    if type(v) == types.DictType:
                        env.m4ed[k] = dict(env.m4ed[k], **userconfig[k])
                    else:
                        env.m4ed[k] = v
                else:
                    env.m4ed[k] = v

        return True

    except Exception, e:
        _mprint("failed with %s" % e, st="fail", c="bred")
        env.m4ed = {}
        return False


def _print_dict_data(k, d, indent):
    _mprint("%s%s {}:" % (indent, k), c="bred", st="data")
    indent += "    "
    for dk in sorted(d.iterkeys()):
        if type(d[dk]) == types.DictType:
            _print_dict_data(dk, d, indent)
        elif type(d[dk]) == types.ListType:
            _print_list_data(dk, d[dk], indent)
        else:
            _mprint("%s\033[32m%s:\033[0m %s" % (indent, dk, str(d[dk])), st="data", c="data")


def _print_list_data(k, d, indent):
    _mprint("%s%s []:" % (indent, k), st="data", c="bcyan")
    indent += "   "
    for li in sorted(d):
        if type(li) == types.DictType:
            _print_dict_data(k, li, indent)
        elif type(li) == types.ListType:
            _print_list_data(k, li, indent)
        else:
            _mprint("%s%s" % (indent, li), st="data", c="data")


def _print_current_config():
    _mprint("CURRENT CONFIGURATION", ff=True, footer=True, c="bgreen")
    # the problem wasn't this, it was the list sorting..
    # TODO: you can again use the env.m4ed directly
    # no need to make copies of it.
    sortdict = dict(env.m4ed)
    for k in sorted(sortdict.iterkeys()):
        if type(sortdict[k]) == types.DictType:
            _print_dict_data(k, sortdict[k], "")

        elif type(sortdict[k]) == types.ListType:
            _print_list_data(k, sortdict[k], "")
        else:
            _mprint("\033[32m%s:\033[33m %s" % (k, str(sortdict[k])), st="data", c="bblue")
    _mprint("", title=True, c="bgreen")


def _has_no_config():
    if not(env.get("m4ed", {})):
        _mprint("\033[5mWARNING! NO CONFIG AT THE MOMENT!",
                st="fail", c="bred", ff=True)
        return True
    return False


def _add_system_user(username):
    """adds new system user with given username"""
    with settings(hide('warnings', 'stdout', 'running'), warn_only=True):
        sudo('adduser --system --home /nonexistent --group' + \
             ' --shell /bin/false --no-create-home --gecos' + \
             ' "%s user" %s' % (username, username))


def _add_user_to_group(username, group):
    """adds user to given group"""
    with settings(hide('warnings', 'stdout', 'running'), warn_only=True):
        sudo('usermod -g %s %s' % (group, username))


def _get_pkgdata(package_path):
    """
    parses filename from package path, removes extension from it
    and returns stripped version with only the package filename portion
    uses list as regexps might be bad with e.g. "app-3.12a.proto.tar.gz"

    """
    re_ext = re.compile("[^/]*$")  # matches e.g. file.tar.gz, file.git
    filename = re_ext.findall(package_path)[0]
    if filename.endswith(".tar.gz"):
        cmd = "wget %s; tar xvf %s" % (package_path, filename)
        pad = 7
    elif filename.endswith(".py"):
        cmd = "wget %s" % package_path
        pad = 0
    else:
        cmd = "git clone %s" % package_path
        pad = 4
    if pad > 0:
        filename = filename[:-pad]
    return {"cmd": cmd, "dir": filename}


def _mprint(message, c="white", st="", title=False, footer=False,
                    lf=False, ff=False, silent=False):
    """
    Colorful print for menus and messages

    Arguments:
        message - the message that gets printed

    Keyword arguments:
        c  -- ("white") defines the text color
        ff -- (False) when true, outputs blank line before message
        lf -- (False) when true, outputs blank line after message
        title -- (False) when true, creates 79 chars wide line above message
        footer -- (False) when true, creates 79 chars wide line below message
        st -- ("") prints additional status block to the beginning of line
        silent -- (False) when true, returns silently

        allowed statuses are: ok, info, fail, data
        allowed colors are: black, red, green, yellow, blue, magenta, cyan,
                            white, bblack, bred, bgreen, byellow, bblue,
                            bmagenta, bcyan, bwhite, install(yellow),
                            info(cyan), ok(green), fail(red), data(byellow)


                            the "b" stands for "bright"

    """
    if silent:
        return True


    s = {"ok":  "\033[37m[  \033[0m\033[32mOK\033[37m  ]\033[0m ",
        "info": "\033[37m[ \033[0m\033[36minfo\033[37m ]\033[0m ",
        "data": "\033[37m[ \033[0m\033[33mdata\033[37m ]\033[0m ",
        "fail": "\033[37m[ \033[0m\033[31mFAIL\033[37m ]\033[0m "}

    r = {"black":     "\033[30m%s\033[0m",
         "red":       "\033[31m%s\033[0m",
         "green":     "\033[32m%s\033[0m",
         "yellow":    "\033[33m%s\033[0m",
         "blue":      "\033[34m%s\033[0m",
         "magenta":   "\033[35m%s\033[0m",
         "cyan":      "\033[36m%s\033[0m",
         "white":     "\033[37m%s\033[0m",
         "bblack":    "\033[90m%s\033[0m",
         "bred":      "\033[91m%s\033[0m",
         "bgreen":    "\033[92m%s\033[0m",
         "byellow":   "\033[93m%s\033[0m",
         "bblue":     "\033[94m%s\033[0m",
         "bmagenta":  "\033[95m%s\033[0m",
         "bcyan":     "\033[96m%s\033[0m",
         "bwhite":    "\033[97m%s\033[0m"}

    r["install"] = r["yellow"]
    r["info"] = r["cyan"]
    r["ok"] = r["green"]
    r["fail"] = r["red"]
    r["data"] = r["byellow"]

    if ff:
        print ""

    if title:
        print r.get(c, "white") % (79 * "=")

    if message:
        print "%s%s" % (s.get(st, ""), r.get(c, "white") % message)

    if footer:
        print r.get(c, "white") % (79 * "=")

    if lf:
        print ""


def _json_minify(json, strip_space=True):
    """
    Strips // single line comments and /* multiline */ comments in json
    v0.1 (C) Gerald Storer, MIT License
    Based on JSON.minify.js: https://github.com/getify/JSON.minify

    arguments:

    """

    tokenizer = re.compile('"|(/\*)|(\*/)|(//)|\n|\r')
    in_string = False
    in_multiline_comment = False
    in_singleline_comment = False

    new_str = []
    from_index = 0

    for match in re.finditer(tokenizer, json):

        if not in_multiline_comment and not in_singleline_comment:
            tmp2 = json[from_index:match.start()]
            if not in_string and strip_space:
                tmp2 = re.sub('[ \t\n\r]*', '', tmp2)
            new_str.append(tmp2)

        from_index = match.end()

        if match.group() == '"' and not in_multiline_comment and \
          not in_singleline_comment:

            escaped = re.search('(\\\\)*$', json[:match.start()])
            if not in_string or escaped is None or \
              len(escaped.group()) % 2 == 0:
                in_string = not in_string
            from_index -= 1

        elif match.group() == '/*' and not in_string and \
          not in_multiline_comment and not in_singleline_comment:
            in_multiline_comment = True
        elif match.group() == '*/' and not in_string and \
          in_multiline_comment and not in_singleline_comment:
            in_multiline_comment = False
        elif match.group() == '//' and not in_string and \
          not in_multiline_comment and not in_singleline_comment:
            in_singleline_comment = True
        elif (match.group() == '\n' or match.group() == '\r') and \
          not in_string and not in_multiline_comment and in_singleline_comment:
            in_singleline_comment = False
        elif not in_multiline_comment and not in_singleline_comment and (
             match.group() not in ['\n', '\r', ' ', '\t'] or not strip_space):
                new_str.append(match.group())

    new_str.append(json[from_index:])
    return ''.join(new_str)


